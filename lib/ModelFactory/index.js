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

            model.findOneAndUpdateWithOptimisticConcurrencyCheck = function (resource, callback) {
                function transformToChangeSet(doc, ret, options) {
                    delete ret._id;
                    delete ret._version;
                }

                var changeSet = resource.toObject({transform: transformToChangeSet});
                model.findOneAndUpdate({_id: resource.id, _version: resource._version}, {$set: changeSet, $inc: {_version: 1}}, function (err, doc) {
                    if (err) return callback(err);
                    if (!doc) return callback(new Error('Concurrency error'));

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

    return new Promise(function(resolve, reject){
        async.waterfall([
            checkPreconditions,
            makeModelFromSchema,
            referenceModelFromMongoose
        ], function (err, model) {
            if (err) return reject(err);

            resolve(model);
        });
    });
};

module.exports = exports = ModelFactory;