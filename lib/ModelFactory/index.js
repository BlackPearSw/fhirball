var Promise = require('bluebird');
var async = require('async');
var mongoose = require('mongoose');
var options = require('./options');

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

        callback(null, schema);
    }

    function makeModelFromSchema(schema, callback){
        var model = mongoose.model(name, mongoose.Schema(schema, options));

        model.findOneAndUpdateWithOptimisticConcurrencyCheck = function (resource, callback) {
            function transformToChangeSet(doc, ret, options) {
                delete ret._id;
                delete ret._version;
            }

            var type = resource.resourceType;
            var changeSet = resource.toObject({transform: transformToChangeSet});
            model.findOneAndUpdate({_id: resource.id, _version: resource._version}, {$set: changeSet, $inc: {_version: 1}}, function (err, doc) {
                if (err) return callback(err);
                if (!doc) return callback(new Error('Concurrency error'));

                return callback(null, doc);
            });
        };

        callback(null, model);
    }


    return new Promise(function(resolve, reject){
        async.waterfall([
            checkPreconditions,
            makeModelFromSchema
        ], function (err, model) {
            if (err) return reject(err);

            resolve(model);
        });
    });
};

module.exports = exports = ModelFactory;