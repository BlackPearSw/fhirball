var express = require('express');
var mongoose = require('mongoose');
var SchemaFactory = require('../SchemaFactory/index');
var ModelFactory = require('../ModelFactory/index');
var RouteFactory = require('../RouteFactory/index');
var async = require('async');
var bodyParser = require('body-parser');

DEFAULT_CONTENT_TYPE = 'application/json';

var Router = function (options) {
    if (!options.conformance) {
        throw new Error('conformance undefined');
    }

    options['content-type'] = options['content-type'] || DEFAULT_CONTENT_TYPE;

    var schemaFactory = new SchemaFactory();
    var modelFactory = new ModelFactory();
    var routeFactory = new RouteFactory(options['content-type']);
    var api = express.Router();
    var jsonParser = bodyParser.json({type: options['content-type']});
    api.use(jsonParser);
    if (options.middleware && Array.isArray(options.middleware)) {
        options.middleware.forEach(function (handler) {
            api.use(handler);
        });
    }

    function connectDb(callback) {
        try {
            mongoose.connect(options.db);
            callback();
        }
        catch (ex) {
            callback(ex);
        }
    }

    function decorateConformance(callback) {
        try {
            options.conformance.acceptUnknown = true;
            options.conformance.format = ['json'];

            callback();
        }
        catch (ex) {
            callback(ex);
        }
    }

    function addMetadataRoutes(callback) {
        try {
            api.get('/', routeFactory.makeConformance(options.conformance));
            api.get('/metadata', routeFactory.makeConformance(options.conformance));
            callback();
        }
        catch (ex) {
            callback(ex);
        }
    }

    function parseResource(resource, callback) {

        function decorateConformance(callback) {
            try {
                resource.readHistory = resource.readHistory || false;
                resource.updateCreate = false;
                resource.searchInclude = [];

                resource.searchParam = resource.searchParam || [];

                callback();
            }
            catch (ex) {
                callback(ex);
            }
        }

        function initOptions(callback) {
            var options = {
                resourceType: resource.type,
                audit: {
                    prefix: '~',
                    schema: null,
                    model: null
                },
                current: {
                    schema: null,
                    model: null
                }
            };
            callback(null, options);
        }

        function makeAuditSchema(options, callback) {
            if (resource.readHistory) {
                schemaFactory.make(options.audit.prefix + options.resourceType)
                    .then(function (schema) {
                        //remove keys that aren't audited
                        delete schema.tags;
                        delete schema.index;
                        schema.deleted = {type: Date};

                        options.audit.schema = schema;

                        callback(null, options);
                    })
                    .catch(function (err) {
                        callback(err);
                    });
            }
            else {
                callback(null, options);
            }
        }

        function makeAuditModel(options, callback) {
            if (resource.readHistory) {
                modelFactory.make(options.audit.prefix + options.resourceType, options.audit.schema)
                    .then(function (model) {
                        options.audit.model = model;
                        callback(null, options);
                    })
                    .catch(function (err) {
                        callback(err);
                    });
            }
            else {
                callback(null, options);
            }
        }

        function makeCurrentSchema(options, callback) {
            schemaFactory.make(options.resourceType)
                .then(function (schema) {
                    options.current.schema = schema;
                    callback(null, options);
                })
                .catch(function (err) {
                    callback(err);
                });
        }

        function makeCurrentModel(options, callback) {
            modelFactory.make(options.resourceType, options.current.schema)
                .then(function (model) {
                    options.current.model = model;
                    callback(null, options);
                })
                .catch(function (err) {
                    callback(err);
                });
        }

        function parseOperation(options, callback) {
            var opOrder = {
                'history-type': 0,
                'search-type': 1,
                'create': 2,           //post
                'history-instance': 3,
                'delete': 4,           //delete
                'update': 5,           //put
                'vread': 6,
                'read': 7,

                'validate': 0         //not implemented yet
            };

            //sort operations so routes for search-type evaluated before read
            resource.operation.sort(function(a, b){
                return opOrder[a.code] - opOrder[b.code];
            });

            async.map(resource.operation, function (operation, callback) {
                if (operation.code === 'search-type') {
                    var route = routeFactory.make(options.current.model, operation.code, resource.searchParam);

                    api.get('/' + resource.type, route);
                    api.get('/' + resource.type + '/_search', route);

                    routeFactory.ensureIndexes(options.current.model, resource.searchParam);
                }
                else {
                    var route = routeFactory.make(options.current.model, operation.code, resource.searchParam, options.audit.model);

                    //instance interactions
                    if (operation.code === 'read') {
                        api.get('/' + resource.type + '/:id/_tags', routeFactory.makeReadTagsForInstance(options.current.model));
                        api.get('/' + resource.type + '/:id', route);
                    }

                    if (operation.code === 'vread') {
                        api.get('/' + resource.type + '/:id/_history/:vid', route);

                        routeFactory.ensureIndexesForHistory(options.audit.model);
                    }

                    if (operation.code === 'update') {
                        api.put('/' + resource.type + '/:id', route);
                    }

                    if (operation.code === 'delete') {
                        api.delete('/' + resource.type + '/:id', route);
                    }

                    if (operation.code === 'history-instance') {
                        api.get('/' + resource.type + '/:id/_history', route);

                        routeFactory.ensureIndexesForHistory(options.audit.model);
                    }

                    //type interactions
                    if (operation.code === 'history-type') {
                        api.get('/' + resource.type + '/_history$', route);

                        routeFactory.ensureIndexesForHistory(options.audit.model);
                    }

                    if (operation.code === 'create') {
                        api.post('/' + resource.type + '/:id/_tags/_delete', routeFactory.makeDeleteTagsForInstance(options.current.model));
                        api.post('/' + resource.type + '/:id/_tags', routeFactory.makeCreateTagsForInstance(options.current.model));
                        api.post('/' + resource.type, route);
                    }
                }

                callback(null);
            }, callback);
        }

        async.waterfall([
            decorateConformance,
            initOptions,
            makeAuditSchema,
            makeAuditModel,
            makeCurrentSchema,
            makeCurrentModel,
            parseOperation
        ], callback);
    }

    function parseRest(rest, callback) {
        if (rest.mode === 'server') {
            async.map(rest.resource, parseResource, callback);
        }
    }

    function parseConformance(callback) {
        async.map(options.conformance.rest, parseRest, function (err) {
            if (err) return callback(err);
        });
        callback();
    }

    async.waterfall([
            connectDb,
            decorateConformance,
            addMetadataRoutes,
            parseConformance
        ],
        function (err) {
            if (err) throw(err);
        }
    );

    return api;
};

module.exports = exports = Router;