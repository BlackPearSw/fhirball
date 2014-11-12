var express = require('express');
var mongoose = require('mongoose');
var SchemaFactory = require('../SchemaFactory/index');
var ModelFactory = require('../ModelFactory/index');
var RouteFactory = require('../RouteFactory/index');
var async = require('async');
var bodyParser = require('body-parser');

var Router = function (options) {
    if (!options.conformance) {
        throw new Error('conformance undefined');
    }

    var schemaFactory = new SchemaFactory();
    var modelFactory = new ModelFactory();
    var routeFactory = new RouteFactory(options['content-type']);
    var api = express.Router();
    var jsonParser = bodyParser.json();  //TODO: refactor to allow use of application/fhir+json

    api.get('/', routeFactory.makeConformance(options.conformance));
    api.get('/metadata', routeFactory.makeConformance(options.conformance));

    function connectDb(callback) {
        try {
            mongoose.connect(options.db);
            callback();
        }
        catch (ex) {
            callback(ex);
        }
    }

    function parseResource(resource, callback) {

        function getResourceType(callback) {
            callback(null, resource.type);
        }

        function makeSchema(resourceType, callback) {
            schemaFactory.make(resourceType)
                .then(function (schema) {
                    callback(null, schema);
                })
                .catch(function (err) {
                    callback(err);
                });
        }

        function makeModel(schema, callback) {
            modelFactory.make(resource.type, schema)
                .then(function (model) {
                    callback(null, model);
                })
                .catch(function (err) {
                    callback(err);
                });
        }

        function parseOperation(model, callback) {
            async.map(resource.operation, function (operation, callback) {
                if (operation.code === 'search-type') {
                    var route = routeFactory.make(model, operation.code, resource.searchParam);

                    api.get('/' + resource.type, route);
                    api.get('/' + resource.type + '/_search', route);

                }
                else {
                    var route = routeFactory.make(model, operation.code);
                    if (operation.code === 'read') {
                        api.get('/' + resource.type + '/:id', route);
                    }

                    if (operation.code === 'update') {
                        api.put('/' + resource.type + '/:id', jsonParser, route);
                    }

                    if (operation.code === 'delete') {
                        api.delete('/' + resource.type + '/:id', route);
                    }

                    if (operation.code === 'create') {
                        api.post('/' + resource.type, jsonParser, route);
                    }
                }

                callback(null);
            }, callback);
        }

        async.waterfall([
            getResourceType,
            makeSchema,
            makeModel,
            parseOperation
        ], callback);
    }

    function parseRest(rest, callback) {
        if (rest.mode === 'server') {
            async.map(rest.resource, parseResource, callback);
        }
    }

    function parseConformance(callback) {
        //TODO: refactor from below
    }

    async.waterfall([
            connectDb,
            function (callback) {
                async.map(options.conformance.rest, parseRest, function (err) {
                    if (err) return callback(err);
                });
            }
        ],
        function (err) {
            if (err) throw(err);
        }
    );

    return api;
};

module.exports = exports = Router;