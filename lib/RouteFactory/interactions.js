const mongoose = require('mongoose');
const bundler = require('../fhir/bundler');
const routeFuncs = require('./routeFuncs');
const query = require('./search/query');
const aggregate = require('./search/aggregate');
const paging = require('./search/paging');
const indexes = require('./search/indexes');
const tags = require('./tags');

//polyfill String.contains
if (!String.prototype.contains) {
    String.prototype.contains = function () {
        return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
}

function getHref(req) {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const uri = req.headers['x-forwarded-uri'] || req.originalUrl;
    return protocol + '://' + req.headers.host + uri;
}

function bundle(docs, link) {
    return bundler.make(docs, 'Search result', link);
}

const error = {
    BAD_REQUEST: 'BAD_REQUEST',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    PRECONDITION_FAILED: 'PRECONDITION_FAILED',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
};

const httpStatus = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
    PRECONDITION_FAILED: 412,
    INTERNAL_SERVER_ERROR: 500
};

function docFromArray(input) {
    if (Array.isArray(input)) {
        return input[0];
    } else {
        return input;
    }
}

function auditChange(model, user) {
    if (model) {
        return function (doc) {
            const pojo = doc.toObject();
            pojo._id = new mongoose.Types.ObjectId();
            pojo.meta.user = user;
            return model(pojo)
                .save()
                .then(function () {
                    return doc;
                });
        }
    } else {
        return function (doc) {
            return Promise.resolve(doc);
        }
    }
}

function auditDeletion(model, user) {
    if (model) {
        return function (doc) {
            const pojo = doc.toObject();
            pojo.id = new mongoose.Types.ObjectId();
            pojo.meta.deleted = pojo.meta.lastUpdated;
            delete pojo.meta.lastUpdated;
            pojo.meta.user = user;
            pojo.resource = {resourceType: pojo.resource.resourceType};
            return model(pojo)
                .save()
                .then(function () {
                    return doc;
                });
        }
    } else {
        return function (doc) {
            return Promise.resolve(doc);
        }
    }
}

function sendResource(req, res, contentType) {
    return function (doc) {
        if (!doc) throw new Error(error.NOT_FOUND);

        const location = routeFuncs.makeContentLocationForExistingResource(req, doc);
        const category = tags.getCategoryHeader(doc.tags);
        const body = JSON.stringify(doc.toObject().resource);
        res.set('Content-Type', contentType);
        res.set('Content-Location', location);
        res.set('Category', category);
        res.status(httpStatus.OK).send(body);
    }
}

function sendCreationHeaders(req, res) {
    return function (doc) {
        if (!doc) throw new Error(error.INTERNAL_SERVER_ERROR);

        const location = routeFuncs.makeContentLocationForNewResource(req, doc);
        res.set('Location', location);
        res.status(httpStatus.CREATED).end();
    }
}

function sendHeaders(req, res) {
    return function (doc) {
        if (!doc) throw new Error(error.INTERNAL_SERVER_ERROR);

        const location = routeFuncs.makeContentLocationForExistingResource(req, doc);
        res.set('content-location', location);
        res.set('last-modified', doc.meta.lastUpdated);
        res.status(httpStatus.OK).end();
    }
}

function sendDeletionHeaders(req, res) {
    return function () {
        res.status(httpStatus.NO_CONTENT).end();
    }
}

function sendOperationOutcome(res) {
    return function (err) {
        res.status(httpStatus[err.message] || httpStatus.INTERNAL_SERVER_ERROR).end();
    }
}

/* Instance level interactions */
exports.read = function (model, contentType) {
    return function (req, res) {
        if (!req.params.id) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
        }

        const criteria = {'_id': mongoose.Types.ObjectId(req.params.id)};
        model
            .findOne(criteria).exec()
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

        const criteria = {'meta.id': req.params.id, 'meta.versionId': req.params.vid, 'meta.deleted': {$exists: false}};
        auditModel
            .findOne(criteria).exec()
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

        const pojo = routeFuncs.makePojo(req);
        indexes.decorate(pojo, searchParam);
        const obj = model(pojo);
        obj._id = new mongoose.Types.ObjectId(obj.meta.id);
        obj._version = obj.meta.versionId;

        model
            .findOneAndUpdateWithOptimisticConcurrencyCheck(obj)
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

        const criteria = {'_id': new mongoose.Types.ObjectId(req.params.id)};
        model
            .findOneAndRemove(criteria).exec()
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

        const ops = query.reduceToOperations(req.query, searchParam);
        ops.match.push({'meta.id': req.params.id});
        ops.sort.push({'meta.lastUpdated': -1});
        const pipeline = aggregate.reduceToPipeline(ops);

        auditModel
            .aggregate(pipeline).exec()
            .then(function (docs) {
                const more = docs.length === ops.paging.count;
                const link = paging.getLink(req, ops.toString(), ops.paging, more);
                res.set('Content-Type', contentType);
                res.status(httpStatus.OK).send(bundle(docs, link));
            })
            .catch(function () {
                res.status(httpStatus.BAD_REQUEST).end();
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

        const tagList = req.body;
        const criteria = {'_id': mongoose.Types.ObjectId(req.params.id)};
        const update = {$addToSet: {tags: {$each: tagList.category}}};

        model
            .updateOne(criteria, update).exec()
            .then(function () {
                res.status(httpStatus.OK).end();
            })
            .catch(function () {
                res.status(httpStatus.BAD_REQUEST).end();
            });
    };
};

exports.readTagsForInstance = function (model, contentType) {
    return function (req, res) {
        if (!req.params.id) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
        }

        const criteria = {'_id': mongoose.Types.ObjectId(req.params.id)};
        const projection = {tags: true};
        model
            .findOne(criteria, projection).exec()
            .then(function (doc) {
                if (!doc) return res.status(404).end();

                const tagList = tags.getTagList(doc.tags);
                res.set('Content-Type', contentType);
                res.status(httpStatus.OK).send(JSON.stringify(tagList));
            })
            .catch(function () {
                res.status(httpStatus.BAD_REQUEST).end();
            });
    };
};

exports.deleteTagsForInstance = function (model, contentType) {
    return function (req, res) {
        if (!req.params['id']) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
        }

        if (!req.headers['content-type'].contains(contentType)) {
            return res.status(httpStatus.BAD_REQUEST).end();
        }

        if (!Array.isArray(req.body.category) || req.body.category.length !== 1)
            return res.status(httpStatus.BAD_REQUEST).end();

        const tag = req.body.category[0];
        const criteria = {'_id': mongoose.Types.ObjectId(req.params.id)};
        const update = {$pull: {tags: {term: tag.term, scheme: tag.scheme, label: tag.label}}};

        model
            .updateOne(criteria, update).exec()
            .then(function () {
                res.status(httpStatus.OK).end();
            })
            .catch(function () {
                return res.status(httpStatus.BAD_REQUEST).end();
            });
    };
};

/* Type level interactions */

exports['history-type'] = function (model, contentType, searchParam, auditModel) {
    return function (req, res) {
        const ops = query.reduceToOperations(req.query, searchParam);
        ops.sort.push({'meta.lastUpdated': -1});
        const pipeline = aggregate.reduceToPipeline(ops);

        auditModel.aggregate(pipeline).exec()
            .then(function (docs) {
                const more = docs.length === ops.paging.count;
                const link = paging.getLink(req, ops.toString(), ops.paging, more);
                res.set('Content-Type', contentType);
                res.status(httpStatus.OK).send(bundle(docs, link));
            })
            .catch(function () {
                res.status(httpStatus.BAD_REQUEST).end();
            });
    };
};


exports.create = function (model, contentType, searchParam, auditModel) {
    return function (req, res) {
        if (!req.headers['content-type'].contains(contentType)) {
            return res.status(httpStatus.BAD_REQUEST).end();
        }

        const pojo = routeFuncs.makePojo(req);
        indexes.decorate(pojo, searchParam);
        const obj = model(pojo);
        obj._id = new mongoose.Types.ObjectId(obj.meta.id);
        obj._version = obj.meta.versionId;
        const promise = obj.save();

        promise.then(docFromArray)
            .then(auditChange(auditModel, req.user))
            .then(sendCreationHeaders(req, res))
            .catch(sendOperationOutcome(res));
    };
};

exports['search-type'] = function (model, contentType, searchParam) {
    return function (req, res) {
        const ops = query.reduceToOperations(req.query, searchParam);
        const pipeline = aggregate.reduceToPipeline(ops);

        model
            .aggregate(pipeline).exec()
            .then(function (docs) {
                const more = docs.length === ops.paging.count;
                const link = paging.getLink(req, ops.toString(), ops.paging, more);
                res.set('Content-Type', contentType);
                res.status(httpStatus.OK).send(bundle(docs, link));
            })
            .catch(function (err) {
                return res.status(httpStatus.BAD_REQUEST).end();
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
