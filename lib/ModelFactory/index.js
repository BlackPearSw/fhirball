const async = require('async');
const options = require('./options');
const mongoose = require('mongoose');

const ModelFactory = function () {

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
            const model = mongoose.model(name, new mongoose.Schema(schema, options));
            model.findOneAndUpdateWithOptimisticConcurrencyCheck = function (obj) {
                obj.meta.versionId = (obj._version + 1).toString();
                return model
                    .findOneAndUpdate(
                    {_id: obj.id, _version: obj._version},
                    {
                        $inc: {_version: 1},
                        $set: {meta: obj.meta, resource: obj.resource, index: obj.index},
                        $addToSet: {tags: {$each: obj.tags}}
                    })
                    .exec()
                    .then(function(doc){
                        if (!doc)
                            throw new Error('CONFLICT');

                        return doc;
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

    return new Promise(function(resolve, reject) {
        async.waterfall([
            checkPreconditions,
            makeModelFromSchema,
            referenceModelFromMongoose
        ], function (err, model) {
            if (err)
                reject(err);
            else
                resolve(model);
        });
    });
};

module.exports = exports = ModelFactory;