var Promise = require('bluebird');
var async = require('async');
var fs = require('fs');
var libxml = require('libxmljs');

var types = require('./../fhir/types');
var parser = require('./../fhir/parser');
var builder = require('./builder');

var SchemaFactory = function () {
};

SchemaFactory.prototype.make = function (path, valueSetDictionary) {
    var schema = {};

    function checkPreconditions(callback){
        if (!path) {
            return callback(new Error('path undefined'));
        }

        if (!valueSetDictionary) {
            return callback(new Error('valueSetDictionary undefined'));
        }

        callback(null);
    }

    function readProfile(callback) {
        fs.readFile(path, {encoding: 'utf8'}, function (err, data) {
            if (err) return callback(err);

            var profile = parser.fromXml(data);

            callback(null, profile);
        });
    }

    function transformProfileToSchema(profile, callback) {
        profile.structure.element.forEach(elementToProperty);
        callback(null, schema);
    }

    function elementToProperty(element) {

        function parsePath(path){
            return path.split('.');
        }

        function definesResourceType(element){
            return parsePath(element.path).length === 1;
        }

        function definesBranch(element){
            return parsePath(element.path).length > 1 && element.definition.type === undefined;
        }

        function definesMixedLeaf(element){
            return definesLeaf(element) && element.path.contains('[x]');
        }

        function definesLeaf(element){
            return parsePath(element.path).length > 1 && element.definition.type !== undefined;
        }

        function addField(field){
            var path = parsePath(element.path);
            path.shift();
            var target = path.reduce(function(result, item){
                if (result[item]) {
                    if (Array.isArray(result[item])){
                        return result[item][0];
                    }
                    else {
                        return result[item];
                    }
                } else {
                    return result
                }
            }, schema);
            target[field.key] = field.value;
        }

        if (definesResourceType(element)) {
            schema.resourceType = builder.makeResourceType(element).value;
        }
        else if (definesBranch(element)) {
            addField(builder.makeBranch(element));
        }
        else if (definesMixedLeaf(element)) {
            var fields = builder.makeMixedLeaf(element, valueSetDictionary);
            fields.forEach(addField);
        }
        else if (definesLeaf(element)) {
            addField(builder.makeLeaf(element, valueSetDictionary));
        }
    }

    return new Promise(function(resolve, reject){
        async.waterfall([
            checkPreconditions,
            readProfile,
            transformProfileToSchema
        ], function (err, schema) {
            if (err) return reject(err);

            resolve(schema);
        });
    });
};

module.exports = exports = SchemaFactory;