var mongoose = require('mongoose');
var bundler = require('../fhir/bundler');
var createBuffer = require('./utils').createBuffer;

//polyfill String.contains
if ( !String.prototype.contains ) {
    String.prototype.contains = function() {
        return String.prototype.indexOf.apply( this, arguments ) !== -1;
    };
}

function getHref(req){
    return req.protocol + '://' + req.headers.host + req.originalUrl;
}

function bundle(req, docs){
    return bundler.make(docs, 'Search result', getHref(req));
}

/* Instance level interactions */
exports.read = function (model) {
    return function (req, res) {
        if (! req.params.id) {
            return res.status(500).end();
        }

        var conditions = {'_id' : mongoose.Types.ObjectId(req.params.id)};
        model.findOne(conditions, function (err, doc) {
            if (err) return res.status(400).end();
            if (!doc) return res.status(404).end();

            var version = doc._version || 0;
            var location = req.protocol + '://' + req.headers.host + req.originalUrl + '/_history/' + version;

            res.set('Content-Type', 'application/json; charset=utf-8');
            res.set('Content-Location', location);
            res.status(200).send(doc.toObject());
        });
    };
};

exports.update = function (model) {
    return function (req, res) {
        if (! req.params['id']) {
            return res.status(500).end();
        }

        if (!req.headers['content-type'].contains('application/json')){
            return res.status(400).end();
        }

        if (! req.headers['content-location']){
            return res.status(412).end();
        }

        var datalen = parseInt(req.headers['content-length']);
        var pos = 0x0;
        var data = createBuffer(datalen);
        req.on('data', function (chunk) {
            //check for buffer overflow
            if (pos + chunk.length > datalen) {
                throw new Error('data exceeded content-length');
            }
            chunk.copy(data, pos);
            pos += chunk.length;
        });
        req.on('end', function () {
            var pojo = JSON.parse(data.toString());
            var obj = model(pojo);
            obj._id = mongoose.Types.ObjectId(req.params.id);
            obj._lastModifiedDate = new Date();
            model.findOneAndUpdateWithOptimisticConcurrencyCheck(obj, function (err, doc) {
                if (err) return res.status(err.message === 'Concurrency error' ? 409 : 500).end();

                var location = req.protocol + '://' + req.headers.host + req.originalUrl + '/_history/' + doc._version;

                res.set('content-location', location);
                res.set('last-modified', doc._lastModifiedDate);
                res.status(200).end();
            });
        });
    };
};

exports.delete = function (model) {
    return function (req, res) {
        if (! req.params.id) {
            return res.status(500).end();
        }

        var conditions = {'_id' : mongoose.Types.ObjectId(req.params.id)};
        model.findOneAndRemove(conditions, function (err, doc) {
            if (err) return res.status(500).end();

            res.status(204).end();
        });
    };
};

/* Type level interactions */
exports.create = function (model) {
    return function (req, res) {
        if (!req.headers['content-type'].contains('application/json')){
            return res.status(400).end();
        }

        var datalen = parseInt(req.headers['content-length']);
        var pos = 0x0;
        var data = createBuffer(datalen);
        req.on('data', function (chunk) {
            //check for buffer overflow
            if (pos + chunk.length > datalen) {
                throw new Error('data exceeded content-length');
            }
            chunk.copy(data, pos);
            pos += chunk.length;
        });
        req.on('end', function () {
            var pojo = JSON.parse(data.toString());
            var obj = model(pojo);
            obj._version = 0;
            obj._lastModifiedDate = new Date();
            obj.save(function (err, doc) {
                if (err) return res.status(400).end();

                var location = req.protocol + '://' + req.headers.host + req.originalUrl + '/' + doc._id +  '/_history/' + doc._version;

                res.set('Location', location);
                res.status(201).end();
            });
        });
    };
};

exports['search-type'] = function (model, searchParam) {
    searchParam = searchParam || {};
    if (!searchParam['_id']) {
        searchParam['_id'] = {
            name: '_id',
            type: 'token',
            path: '_id'
        };
    }

    function makeConditions(query, searchParam) {
        var conditions = {};
        function addConditions(conditions, search, value){
            if (search.transform){
                search.transform(conditions, value);
            }
            else {
                conditions[search.path] = value;
            }

        }

        for (term in query){
            if (query.hasOwnProperty(term)) {
                var search = searchParam[term];
                if (search) {
                    addConditions(conditions, search, query[term]);
                }
            }
        }

        return conditions;
    }

    return function (req, res) {
        var conditions = makeConditions(req.query, searchParam);

        model.find(conditions, function (err, docs) {
            if (err) return res.status(400).end();

            res.set('Content-Type', 'application/json; charset=utf-8');
            res.status(200).send(bundle(req, docs));
        });
    };
};

/* System level interactions */
exports.conformance = function(statement, options){
    return function (req, res) {
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.set('Location', getHref(req));
        res.status(200).send(statement);
    };
};

//vread - Not planned - system does not maintain history
//history - Not planned - system does not maintain history
//validate - Not planned - TODO: does mongoose provide this capability?
