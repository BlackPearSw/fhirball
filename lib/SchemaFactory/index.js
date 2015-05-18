var Promise = require('bluebird');
var async = require('async');

var mongoose = require('mongoose');

var SchemaFactory = function () {
};

SchemaFactory.prototype.make = function (resourceType) {
    var schema = {};

    function checkPreconditions(callback) {
        if (!resourceType) {
            return callback(new Error('resourceType undefined'));
        }

        callback(null);
    }

    function makeSchema(callback) {
        schema = {
            meta: mongoose.Schema.Types.Mixed,
            tags: mongoose.Schema.Types.Mixed,
            resource: mongoose.Schema.Types.Mixed,
            search: mongoose.Schema.Types.Mixed
        };
        callback(null, schema);
    }

    return new Promise(function (resolve, reject) {
        async.waterfall([
            checkPreconditions,
            makeSchema
        ], function (err, schema) {
            if (err) return reject(err);

            resolve(schema);
        });
    });
}
;

module.exports = exports = SchemaFactory;