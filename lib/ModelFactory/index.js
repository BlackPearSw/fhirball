var Promise = require('bluebird');
var async = require('async');
var options = require('./options');
var mongoose = require('mongoose');

var ModelFactory = function () {

};

ModelFactory.prototype.make = function (name, schema) {
    function checkPreconditions(callback){
        if (!name) {
            return callback(new Error('name undefined'));
        }

        if (!schema) {
            return callback(new Error('schema undefined'));
        }

        if (!mongoose) {
            return callback(new Error('mongoose undefined'));
        }

        callback(null, schema);
    }

    function makeModelFromSchema(schema, callback){
        try {
            var model = mongoose.model(name, mongoose.Schema(schema, options));

            model.findOneAndUpdateWithOptimisticConcurrencyCheck = function (obj, callback) {
                obj.meta.versionId = obj._version + 1;
                model.findOneAndUpdate({_id: obj.id, _version: obj._version}, {$inc: {_version: 1}, $set: {meta: obj.meta, resource: obj.resource, index: obj.index}, $addToSet: {tags: { $each: obj.tags}}}, function (err, doc) {
                    if (err) return callback(err);
                    if (!doc) return callback(new Error('CONFLICT'));

                    return callback(null, doc);
                });
            };

            callback(null, model);
        }
        catch (err){
            callback(err);
        }
    }

    function referenceModelFromMongoose(model, callback){
        mongoose.fhir = mongoose.fhir || {};
        mongoose.fhir[model.modelName] = model;
        callback(null, model);
    }

    function promisifyModel(model, callback){
        Promise.promisifyAll(model);
        callback(null, model);
    }

    return new Promise(function(resolve, reject){
        async.waterfall([
            checkPreconditions,
            makeModelFromSchema,
            referenceModelFromMongoose,
            promisifyModel
        ], function (err, model) {
            if (err) return reject(err);

            resolve(model);
        });
    });
};

module.exports = exports = ModelFactory;