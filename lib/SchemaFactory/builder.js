var types = require('./../fhir/types');

function parsePath(path) {
    var result = path.split('.');
    result.leaf = function () {
        return result[result.length - 1];
    };
    return result;
}

module.exports.makeResourceType = function (element) {
    var path = parsePath(element.path);
    return {
        key: 'resourceType',
        value: { type: types.string, match: new RegExp('^' + path[0] + '$')}
    }
};

module.exports.makeBranch = function (element) {
    var path = parsePath(element.path);
    var value = {};

    if (element.definition.max === '*') {
        value = [value];
    }

    return {
        key: path.leaf(),
        value: value
    };
};

module.exports.makeLeaf = function (element) {
    var path = parsePath(element.path);
    var value = types[element.definition.type.code];

    if (element.definition.max === '*') {
        value = [value];
    }

    return {
        key: path.leaf(),
        value: value
    };
};