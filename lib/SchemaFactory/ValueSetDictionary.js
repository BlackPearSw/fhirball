var Promise = require('bluebird');
var async = require('async');
var fs = require('fs');
var libxml = require('libxmljs');

var types = require('./../fhir/types');
var parser = require('./../fhir/parser');
var builder = require('./builder');

var ValueSetDictionary = function () {

};


ValueSetDictionary.prototype.load = function (path) {
    var self = this;

    function checkPreconditions(callback) {
        if (!path) {
            return callback(new Error('path undefined'));
        }
        return callback();
    }

    function loadValueSet(path, callback) {

        function readFile(callback) {
            fs.readFile(path, {encoding: 'utf8'}, function (err, data) {
                if (err) return callback(err);

                var valueSet = parser.fromXml(data);

                callback(null, valueSet);
            });
        }

        function cacheValueSet(valueSet, callback) {
            self[valueSet.identifier] = valueSet;

            callback(null);
        }

        async.waterfall([
            readFile,
            cacheValueSet
        ], function (err) {
            if (err) return callback(err);

            callback();
        });
    }

    function loadValueSetsFromPath(callback) {
        fs.readdir(path, function (err, files) {
            if (err) return callback(err);

            async.map(files, function (file, callback) {
                loadValueSet(path + '/' + file, callback);
            }, function (err) {
                if (err) return callback(err);

                return callback();
            });
        });
    }

    return new Promise(function (resolve, reject) {
        async.waterfall([
            checkPreconditions,
            loadValueSetsFromPath
        ], function (err) {
            if (err) return reject(err);

            resolve();
        });
    });
};


module.exports = exports = ValueSetDictionary;