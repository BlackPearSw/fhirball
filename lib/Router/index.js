const express = require('express');
const mongoose = require('mongoose');
const SchemaFactory = require('../SchemaFactory/index');
const ModelFactory = require('../ModelFactory/index');
const RouteFactory = require('../RouteFactory/index');
const async = require('async');
const bodyParser = require('body-parser');

DEFAULT_CONTENT_TYPE = 'application/json';

const Router = function (options) {
    if (!options.conformance) {
        throw new Error('conformance undefined');
    }

    options.returnAsPromise = !!options.returnAsPromise;
    options['content-type'] = options['content-type'] || DEFAULT_CONTENT_TYPE;
    options['maxBodySize'] = options['maxBodySize'] || '512kb';

    const schemaFactory = new SchemaFactory();
    const modelFactory = new ModelFactory();
    const routeFactory = new RouteFactory(options['content-type']);
    const api = express.Router();
    const jsonParser = bodyParser.json({type: options['content-type'], limit: options['maxBodySize']});
    api.use(jsonParser);
    if (options.middleware && Array.isArray(options.middleware)) {
        options.middleware.forEach(function (handler) {
            api.use(handler);
        });
    }

    function connectDb() {
        try {
            return mongoose.connect(options.db, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            });
        }
        catch (ex) {
            return Promise.reject(ex);
        }
    }

    function decorateConformance() {
        try {
            options.conformance.acceptUnknown = true;
            options.conformance.format = ['json'];
            return Promise.resolve();
        }
        catch (ex) {
            return Promise.reject(ex);
        }
    }

    function addMetadataRoutes() {
        try {
            api.get('/', routeFactory.makeConformance(options.conformance));
            api.get('/metadata', routeFactory.makeConformance(options.conformance));
            return Promise.resolve();
        }
        catch (ex) {
            return Promise.reject(ex);
        }
    }

    function parseResource(resource, parseResourceCallback) {

        function decorateConformance() {
            try {
                resource.readHistory = resource.readHistory || false;
                resource.updateCreate = false;
                resource.searchInclude = [];
                resource.searchParam = resource.searchParam || [];
                return Promise.resolve();
            }
            catch (ex) {
                return Promise.reject(ex);
            }
        }

        function initOptions() {
            return Promise.resolve({
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
            });
        }

        function makeAuditSchema(options) {
            return resource.readHistory ? schemaFactory.make(options.audit.prefix + options.resourceType)
                .then(function (schema) {
                    //remove keys that aren't audited
                    delete schema.tags;
                    delete schema.index;
                    schema.deleted = {type: Date};
                    options.audit.schema = schema;
                    return options;
                }) : Promise.resolve(options);
        }

        function makeAuditModel(options) {
            return resource.readHistory ? modelFactory.make(options.audit.prefix + options.resourceType, options.audit.schema)
                .then(function (model) {
                    options.audit.model = model;
                    return options;
                }) : Promise.resolve(options);
        }

        function makeCurrentSchema(options) {
            return schemaFactory.make(options.resourceType)
                .then(function (schema) {
                    options.current.schema = schema;
                    return options;
                });
        }

        function makeCurrentModel(options) {
            return modelFactory.make(options.resourceType, options.current.schema)
                .then(function (model) {
                    options.current.model = model;
                    return options;
                });
        }

        function parseOperation(options) {
            const opOrder = {
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
            resource.operation.sort(function (a, b) {
                return opOrder[a.code] - opOrder[b.code];
            });

            async.map(resource.operation, function (operation, mapIteratorCallback) {
                let route;
                try {
                    if (operation.code === 'search-type') {
                        route = routeFactory.make(options.current.model, operation.code, resource.searchParam);
                        api.get('/' + resource.type, route);
                        api.get('/' + resource.type + '/_search', route);
                        routeFactory.ensureIndexes(options.current.model, resource.searchParam);
                        mapIteratorCallback();
                        return;
                    }

                    route = routeFactory.make(options.current.model, operation.code, resource.searchParam, options.audit.model);
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

                    mapIteratorCallback();
                } catch (err) {
                    mapIteratorCallback(err);
                }
            }).then(function () {
                parseResourceCallback();
            }).catch(parseResourceCallback);
        }

        return decorateConformance()
            .then(initOptions)
            .then(makeAuditSchema)
            .then(makeAuditModel)
            .then(makeCurrentSchema)
            .then(makeCurrentModel)
            .then(parseOperation);
    }

    function parseRest(rest, callback) {
        if (rest.mode !== 'server') {
            callback();
            return;
        }

        async.map(rest.resource, parseResource)
            .then(function () {
                callback();
            })
            .catch(callback)
    }

    function parseConformance() {
        return async.map(options.conformance.rest, parseRest);
    }

    const initPromise = connectDb()
                .then(decorateConformance)
                .then(addMetadataRoutes)
                .then(parseConformance)
                .then(function(){
                    return api;
                });

    if (options.returnAsPromise)
        return initPromise;
    else {
        initPromise.catch(function (err) {
            throw(err);
        });

        return api;
    }
};

module.exports = exports = Router;