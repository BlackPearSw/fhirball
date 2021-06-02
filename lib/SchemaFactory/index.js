const async = require('async');
const mongoose = require('mongoose');

const SchemaFactory = function () {
};

SchemaFactory.prototype.make = function (resourceType) {
    if (!resourceType)
        return Promise.reject(new Error('resourceType undefined'));

    return Promise.resolve({
        meta: mongoose.Schema.Types.Mixed,
        tags: mongoose.Schema.Types.Mixed,
        resource: mongoose.Schema.Types.Mixed,
        search: mongoose.Schema.Types.Mixed
    })
};

module.exports = exports = SchemaFactory;