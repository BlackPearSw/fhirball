var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var tags = require('./tags');

var makeMetadata = function (req) {
    if (!req) throw new Error('req undefined');

    function newId(){
        var id = new ObjectId();
        return id.toHexString();
    }

    return {
        id: req.params['id'] ? req.params['id'] : newId(),
        versionId: req.headers['content-location'] ? req.headers['content-location'].split('/_history/')[1] : '0',
        lastUpdated: new Date(),
        user: req.user || 'anonymous'
    };
};

var makeTagList = function(req) {
    if (!req) throw new Error('req undefined');

    return tags.parseCategoryHeader(req.headers['category']);
};

var makePojo = function (req) {
    if (!req) throw new Error('req undefined');
    if (!req.body) throw new Error('req.body undefined');

    return {
        meta: makeMetadata(req),
        tags: makeTagList(req).category,
        resource: req.body             //assumes that body has been parsed
    };
};

var makeContentLocationForNewResource = function(req, doc){
    if (!req) throw new Error('req undefined');
    if (!doc) throw new Error('doc undefined');

    return req.protocol + '://' + req.headers.host + req.originalUrl + '/' + doc._id + '/_history/' + doc._version;
};

var makeContentLocationForExistingResource = function(req, doc){
    if (!req) throw new Error('req undefined');
    if (!doc) throw new Error('doc undefined');

    if (req.originalUrl.indexOf('/_history/') < 0) {
        return req.protocol + '://' + req.headers.host + req.originalUrl + '/_history/' + doc._version;
    }
    else {
        return req.protocol + '://' + req.headers.host + req.originalUrl;
    }
};

module.exports.makePojo = makePojo;
module.exports.makeMetadata = makeMetadata;
module.exports.makeContentLocationForNewResource = makeContentLocationForNewResource;
module.exports.makeContentLocationForExistingResource = makeContentLocationForExistingResource;
module.exports.makeLocationForExistingResource = makeContentLocationForExistingResource;