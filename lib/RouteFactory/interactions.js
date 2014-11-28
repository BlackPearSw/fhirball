var mongoose = require('mongoose');
var bundler = require('../fhir/bundler');
var routeFuncs = require('./routeFuncs');
var query = require('./search/query');
var aggregate = require('./search/aggregate');
var paging = require('./search/paging');
var tags = require('./tags');
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

function bundle(docs, link) {
    return bundler.make(docs, 'Search result', link);
}

/* Instance level interactions */
exports.read = function (model, contentType) {
    return function (req, res) {
        if (!req.params.id) {
            return res.status(500).end();
        }

        var criteria = {'_id': mongoose.Types.ObjectId(req.params.id)};
        model.findOne(criteria, function (err, doc) {
            if (err) return res.status(400).end();
            if (!doc) return res.status(404).end();

            var location = routeFuncs.makeContentLocationForExistingResource(req, doc);
            var category = tags.getCategoryHeader(doc.tags);

            res.set('Content-Type', contentType);
            res.set('Content-Location', location);
            res.set('Category', category);
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
        obj._id = mongoose.Types.ObjectId(obj.meta.id);
        obj._version = obj.meta.versionId;
        model.findOneAndUpdateWithOptimisticConcurrencyCheck(obj, function (err, doc) {
            if (err) return res.status(err.message === 'Concurrency error' ? 409 : 500).end();

            var location = routeFuncs.makeContentLocationForExistingResource(req, doc);

            res.set('content-location', location);
            res.set('last-modified', doc.meta.lastUpdated);
            res.status(200).end();
        });
    };
};

exports.delete = function (model) {
    return function (req, res) {
        if (!req.params.id) {
            return res.status(500).end();
        }

        var criteria = {'_id': mongoose.Types.ObjectId(req.params.id)};
        model.findOneAndRemove(criteria, function (err, doc) {
            if (err) return res.status(500).end();

            res.status(204).end();
        });
    };
};

/* Instance level tag operations */
exports.createTagsForInstance = function (model, contentType) {
    return function (req, res) {
        if (!req.params['id']) {
            return res.status(500).end();
        }

        if (!req.headers['content-type'].contains(contentType)) {
            return res.status(400).end();
        }

        var tagList = req.body;
        var criteria = {'_id': mongoose.Types.ObjectId(req.params.id)};
        var update = {$addToSet: {tags: { $each: tagList.category}}};

        model.update(criteria, update, function (err) {
            if (err) return res.status(400).end();

            res.status(200).end();
        });
    };
};

exports.readTagsForInstance = function (model, contentType){
    return function (req, res) {
        if (!req.params.id) {
            return res.status(500).end();
        }

        var criteria = {'_id': mongoose.Types.ObjectId(req.params.id)};
        var projection = {tags: true};
        model.findOne(criteria, projection, function (err, doc) {
            if (err) return res.status(400).end();
            if (!doc) return res.status(404).end();

            var tagList = tags.getTagList(doc.tags);

            res.set('Content-Type', contentType);
            res.status(200).send(JSON.stringify(tagList));
        });
    }
};

exports.deleteTagsForInstance = function (model, contentType) {
    return function (req, res) {
        if (!req.params['id']) {
            return res.status(500).end();
        }

        if (!req.headers['content-type'].contains(contentType)) {
            return res.status(400).end();
        }

        var tagList = req.body;
        var criteria = {'_id': mongoose.Types.ObjectId(req.params.id)};
        var update = {$pullAll: {tags: tagList.category}};

        model.update(criteria, update, function (err) {
            if (err) return res.status(400).end();

            res.status(200).end();
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
    return function (req, res) {
        var ops = query.reduceToOperations(req.query, searchParam);
        var pipeline = aggregate.reduceToPipeline(ops);

        model.aggregate(pipeline).exec(function (err, docs) {
            if (err) return res.status(400).end();

            var more = docs.length === ops.paging.count
            var link = paging.getLink(req, ops.toString(), ops.paging, more);

            res.set('Content-Type', contentType);
            res.status(200).send(bundle(docs, link));
        });
    };
};

/* Type level tag operations */
//TODO: Needs MongoDB aggregation operations

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
