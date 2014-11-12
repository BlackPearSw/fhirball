var mongoose = require('mongoose');
var bundler = require('../fhir/bundler');
var routeFuncs = require('./routeFuncs');
var conditionFuncs = require('./conditionFuncs');
var fhir = require('../fhir/index');

//polyfill String.contains
if (!String.prototype.contains) {
    String.prototype.contains = function () {
        return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
}

function getHref(req) {
    return req.protocol + '://' + req.headers.host + req.originalUrl;
}

function bundle(req, docs) {
    return bundler.make(docs, 'Search result', getHref(req));
}

/* Instance level interactions */
exports.read = function (model, contentType) {
    return function (req, res) {
        if (!req.params.id) {
            return res.status(500).end();
        }

        var conditions = {'_id': mongoose.Types.ObjectId(req.params.id)};
        model.findOne(conditions, function (err, doc) {
            if (err) return res.status(400).end();
            if (!doc) return res.status(404).end();

            var location = routeFuncs.makeContentLocationForExistingResource(req, doc);

            res.set('content-type', contentType);
            res.set('content-location', location);
            res.status(200).send(JSON.stringify(doc.toObject().resource));
        });
    };
};

exports.update = function (model, contentType) {
    return function (req, res) {
        if (!req.params['id']) {
            return res.status(500).end();
        }

        if (!req.headers['content-type'].contains(contentType)) {
            return res.status(400).end();
        }

        if (!req.headers['content-location']) {
            return res.status(412).end();
        }

        var pojo = routeFuncs.makePojo(req);
        var obj = model(pojo);
        obj._id = mongoose.Types.ObjectId(obj.metadata.id);
        obj._version = obj.metadata.version;
        model.findOneAndUpdateWithOptimisticConcurrencyCheck(obj, function (err, doc) {
            if (err) return res.status(err.message === 'Concurrency error' ? 409 : 500).end();

            var location = routeFuncs.makeContentLocationForExistingResource(req, doc);

            res.set('content-location', location);
            res.set('last-modified', doc.metadata.lastModifiedDate);
            res.status(200).end();
        });
    };
};

exports.delete = function (model) {
    return function (req, res) {
        if (!req.params.id) {
            return res.status(500).end();
        }

        var conditions = {'_id': mongoose.Types.ObjectId(req.params.id)};
        model.findOneAndRemove(conditions, function (err, doc) {
            if (err) return res.status(500).end();

            res.status(204).end();
        });
    };
};

/* Type level interactions */
exports.create = function (model, contentType) {
    return function (req, res) {
        if (!req.headers['content-type'].contains(contentType)) {
            return res.status(400).end();
        }

        var pojo = routeFuncs.makePojo(req);
        var obj = model(pojo);
        obj._version = '0';
        obj.save(function (err, doc) {
            if (err) return res.status(400).end();

            var location = routeFuncs.makeContentLocationForNewResource(req, doc);

            res.set('Location', location);
            res.status(201).end();
        });
    };
};

exports['search-type'] = function (model, contentType, searchParam) {
    searchParam = searchParam || [];
    if (!searchParam['_id']) {
        searchParam['_id'] = {
            name: '_id',
            type: 'token',
            path: '_id'
        };
    }

    function makeConditions(query, searchParam) {
        var conditions = {};

        for (term in query) {
            if (query.hasOwnProperty(term)) {
                conditionFuncs.addCondition(conditions, searchParam, query, term);
            }
        }

        return conditions;
    }

    return function (req, res) {
        var conditions = makeConditions(req.query, searchParam);

        model.find(conditions, function (err, docs) {
            if (err) return res.status(400).end();

            res.set('Content-Type', contentType);
            res.status(200).send(bundle(req, docs.map(function (item) {
                return item.resource;
            })));
        });
    };
};

/* System level interactions */
exports.conformance = function (statement, contentType) {
    return function (req, res) {
        res.set('Content-Type', contentType);
        res.set('Location', getHref(req));
        res.status(200).send(statement);
    };
};

//vread - Not planned - system does not maintain history
//history - Not planned - system does not maintain history
//validate - Not planned
