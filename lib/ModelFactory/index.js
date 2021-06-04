const options = require('./options');
const mongoose = require('mongoose');

const ModelFactory = function () {

};

ModelFactory.prototype.make = function (name, schema) {
    function checkPreconditions() {
        if (!name) {
            return Promise.reject(new Error('name undefined'));
        }

        if (!schema) {
            return Promise.reject(new Error('schema undefined'));
        }

        if (!mongoose) {
            return Promise.reject(new Error('mongoose undefined'));
        }

        return Promise.resolve();
    }

    function makeModelFromSchema() {
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
                .then(function (doc) {
                    if (!doc)
                        throw new Error('CONFLICT');

                    return doc;
                });
        };

        return model;
    }

    function referenceModelFromMongoose(model) {
        mongoose.fhir = mongoose.fhir || {};
        mongoose.fhir[model.modelName] = model;
        return model;
    }

    return checkPreconditions()
        .then(makeModelFromSchema)
        .then(referenceModelFromMongoose)
};

module.exports = exports = ModelFactory;