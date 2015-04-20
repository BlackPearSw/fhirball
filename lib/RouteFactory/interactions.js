var mongoose = require('mongoose');
var bundler = require('../fhir/bundler');
var routeFuncs = require('./routeFuncs');
var query = require('./search/query');
var aggregate = require('./search/aggregate');
var paging = require('./search/paging');
var indexes = require('./search/indexes');
var tags = require('./tags');
var fhir = require('../fhir/index');
var Promise = require('bluebird');

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

var error = {
    BAD_REQUEST: 'BAD_REQUEST',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    PRECONDITION_FAILED: 'PRECONDITION_FAILED',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
};

var httpStatus = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
    PRECONDITION_FAILED: 412,
    INTERNAL_SERVER_ERROR: 500
};

function docFromArray(input){
    if (Array.isArray(input)){
        return input[0];
    }
    else {
        return input;
    }
}

function auditChange(model, user) {
    if (model) {
        return function (doc) {
            return new Promise(function(resolve, reject){
                var pojo = doc.toObject();
                pojo._id = new mongoose.Types.ObjectId();
                pojo.meta.user = user;
                model(pojo).save(function(err){
                    if (err) return reject(err);

                    resolve(doc);
                });
            });
        }
    }
    else {
        return function (doc) {
            return doc;
        }
    }
}

function auditDeletion(model, user) {
    if (model) {
        return function (doc) {
            return new Promise(function(resolve, reject){
                var pojo = doc.toObject();
                pojo.id = new mongoose.Types.ObjectId();
                pojo.meta.deleted = pojo.meta.lastUpdated;
                delete pojo.meta.lastUpdated;
                pojo.meta.user = user;
                pojo.resource = {resourceType: pojo.resource.resourceType};
                model(pojo).save(function(err){
                    if (err) return reject(err);

                    resolve(doc);
                });
            });
        }
    }
    else {
        return function (doc) {
            return doc;
        }
    }
}

function sendResource(req, res, contentType) {
    return function (doc) {
        if (!doc) throw new Error(error.NOT_FOUND);

        var location = routeFuncs.makeContentLocationForExistingResource(req, doc);
        var category = tags.getCategoryHeader(doc.tags);
        var body = JSON.stringify(doc.toObject().resource);

        res.set('Content-Type', contentType);
        res.set('Content-Location', location);
        res.set('Category', category);
        res.status(httpStatus.OK).send(body);
    }
}

function sendCreationHeaders(req, res) {
    return function (doc) {
        if (!doc) throw new Error(error.INTERNAL_SERVER_ERROR);

        var location = routeFuncs.makeContentLocationForNewResource(req, doc);

        res.set('Location', location);
        res.status(httpStatus.CREATED).end();
    }
}


function sendHeaders(req, res) {
    return function (doc) {
        if (!doc) throw new Error(error.INTERNAL_SERVER_ERROR);

        var location = routeFuncs.makeContentLocationForExistingResource(req, doc);

        res.set('content-location', location);
        res.set('last-modified', doc.meta.lastUpdated);
        res.status(httpStatus.OK).end();
    }
}

function sendDeletionHeaders(req, res){
    return function(doc){
        res.status(httpStatus.NO_CONTENT).end();
    }
}

function sendOperationOutcome(res) {
    return function (err) {
        var status = httpStatus[err.message] || httpStatus.INTERNAL_SERVER_ERROR;

        res.status(status).end();
    }
}

/* Instance level interactions */
exports.read = function (model, contentType) {

    return function (req, res) {
        if (!req.params.id) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
        }

        var criteria = {'_id': mongoose.Types.ObjectId(req.params.id)};

        model
            .findOneAsync(criteria)
            .then(sendResource(req, res, contentType))
            .catch(sendOperationOutcome(res));
    };
};

exports.vread = function (model, contentType, searchParam, auditModel) {
    return function (req, res) {
        if (!req.params.id) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
        }

        if (!req.params.vid) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
        }

        var criteria = {'meta.id': req.params.id, 'meta.versionId': req.params.vid};

        auditModel
            .findOneAsync(criteria)
            .then(sendResource(req, res, contentType))
            .catch(sendOperationOutcome(res));
    };
};

exports.update = function (model, contentType, searchParam, auditModel) {
    return function (req, res) {
        if (!req.params['id']) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
        }

        if (!req.headers['content-type'].contains(contentType)) {
            return res.status(httpStatus.BAD_REQUEST).end();
        }

        if (!req.headers['content-location']) {
            return res.status(httpStatus.PRECONDITION_FAILED).end();
        }

        var pojo = routeFuncs.makePojo(req);
        indexes.decorate(pojo, searchParam);
        var obj = model(pojo);
        obj._id = mongoose.Types.ObjectId(obj.meta.id);
        obj._version = obj.meta.versionId;

        model
            .findOneAndUpdateWithOptimisticConcurrencyCheckAsync(obj)
            .then(auditChange(auditModel, req.user))
            .then(sendHeaders(req, res))
            .catch(sendOperationOutcome(res));
    };
};

exports.delete = function (model, contentType, searchParam, auditModel) {
    return function (req, res) {
        if (!req.params.id) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
        }

        var criteria = {'_id': mongoose.Types.ObjectId(req.params.id)};

        model
            .findOneAndRemoveAsync(criteria)
            .then(auditDeletion(auditModel, req.user))
            .then(sendDeletionHeaders(req, res))
            .catch(sendOperationOutcome(res));
    };
};

exports['history-instance'] = function (model, contentType, searchParam, auditModel) {
    return function (req, res) {
        if (!req.params.id) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
        }

        var ops = query.reduceToOperations(req.query, searchParam);
        ops.match.push({'meta.id': req.params.id});
        ops.sort.push({'meta.lastUpdated': -1});
        var pipeline = aggregate.reduceToPipeline(ops);

        auditModel.aggregate(pipeline).exec(function (err, docs) {
            if (err) return res.status(httpStatus.BAD_REQUEST).end();

            var more = docs.length === ops.paging.count;
            var link = paging.getLink(req, ops.toString(), ops.paging, more);

            res.set('Content-Type', contentType);
            res.status(httpStatus.OK).send(bundle(docs, link));
        });

    };
};

/* Instance level tag operations */
exports.createTagsForInstance = function (model, contentType) {
    return function (req, res) {
        if (!req.params['id']) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
        }

        if (!req.headers['content-type'].contains(contentType)) {
            return res.status(httpStatus.BAD_REQUEST).end();
        }

        var tagList = req.body;
        var criteria = {'_id': mongoose.Types.ObjectId(req.params.id)};
        var update = {$addToSet: {tags: {$each: tagList.category}}};

        model.update(criteria, update, function (err) {
            if (err) return res.status(httpStatus.BAD_REQUEST).end();

            res.status(httpStatus.OK).end();
        });
    };
};

exports.readTagsForInstance = function (model, contentType) {
    return function (req, res) {
        if (!req.params.id) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
        }

        var criteria = {'_id': mongoose.Types.ObjectId(req.params.id)};
        var projection = {tags: true};
        model.findOne(criteria, projection, function (err, doc) {
            if (err) return res.status(httpStatus.BAD_REQUEST).end();
            if (!doc) return res.status(404).end();

            var tagList = tags.getTagList(doc.tags);

            res.set('Content-Type', contentType);
            res.status(httpStatus.OK).send(JSON.stringify(tagList));
        });
    }
};

exports.deleteTagsForInstance = function (model, contentType) {
    return function (req, res) {
        if (!req.params['id']) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
        }

        if (!req.headers['content-type'].contains(contentType)) {
            return res.status(httpStatus.BAD_REQUEST).end();
        }

        var tagList = req.body;
        var criteria = {'_id': mongoose.Types.ObjectId(req.params.id)};
        var update = {$pullAll: {tags: tagList.category}};

        model.update(criteria, update, function (err) {
            if (err) return res.status(httpStatus.BAD_REQUEST).end();

            res.status(httpStatus.OK).end();
        });
    };
};

/* Type level interactions */

exports['history-type'] = function (model, contentType, searchParam, auditModel) {
    return function (req, res) {
        var ops = query.reduceToOperations(req.query, searchParam);
        ops.sort.push({'meta.lastUpdated': -1});
        var pipeline = aggregate.reduceToPipeline(ops);

        auditModel.aggregate(pipeline).exec(function (err, docs) {
            if (err) return res.status(httpStatus.BAD_REQUEST).end();

            var more = docs.length === ops.paging.count;
            var link = paging.getLink(req, ops.toString(), ops.paging, more);

            res.set('Content-Type', contentType);
            res.status(httpStatus.OK).send(bundle(docs, link));
        });
    };
};


exports.create = function (model, contentType, searchParam, auditModel) {
    return function (req, res) {
        if (!req.headers['content-type'].contains(contentType)) {
            return res.status(httpStatus.BAD_REQUEST).end();
        }

        var pojo = routeFuncs.makePojo(req);
        indexes.decorate(pojo, searchParam);
        var obj = model(pojo);
        obj._id = mongoose.Types.ObjectId(obj.meta.id);
        obj._version = obj.meta.versionId;
        Promise.promisifyAll(obj);


            obj
                .saveAsync()
                .then(docFromArray)
                .then(auditChange(auditModel, req.user))
                .then(sendCreationHeaders(req, res))
                .catch(sendOperationOutcome(res));
    };
};

exports['search-type'] = function (model, contentType, searchParam) {
    return function (req, res) {
        var ops = query.reduceToOperations(req.query, searchParam);
        var pipeline = aggregate.reduceToPipeline(ops);

        model.aggregate(pipeline).exec(function (err, docs) {
            if (err) return res.status(httpStatus.BAD_REQUEST).end();

            var more = docs.length === ops.paging.count;
            var link = paging.getLink(req, ops.toString(), ops.paging, more);

            res.set('Content-Type', contentType);
            res.status(httpStatus.OK).send(bundle(docs, link));
        });
    };
};

/* Type level tag operations */
//Needs MongoDB aggregation operations - not currently planned

/* System level interactions */
exports.conformance = function (statement, contentType) {
    return function (req, res) {
        res.set('Content-Type', contentType);
        res.set('Location', getHref(req));
        res.status(httpStatus.OK).send(statement);
    };
};

//validate - Not currently planned
