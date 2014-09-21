var types = require('./../fhir/types');

function parsePath(path) {
    var result = path.split('.');
    result.leaf = function () {
        return result[result.length - 1];
    };
    return result;
}

function makeEnumFromValueSet(valueSet) {
    var values = [];

    if (valueSet.define && valueSet.define.concept) {
        if (!Array.isArray(valueSet.define.concept)) {
            valueSet.define.concept = [valueSet.define.concept];
        }

        return valueSet.define.concept.reduce(function (result, item) {
            return result.concat(item.code);
        }, values);
    }

    if (valueSet.compose && valueSet.compose.include) {
        if (!Array.isArray(valueSet.compose.include)) {
            valueSet.compose.include = [valueSet.compose.include];
        }

        return valueSet.compose.include.reduce(function (result, item) {
            return result.concat(item.code);
        }, values);
    }

    return values;
}

module.exports.makeEnumFromValueSet = makeEnumFromValueSet;

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

module.exports.makeMixedLeaf = function (element) {
    var path = parsePath(element.path);
    var codes = Array.isArray(element.definition.type) ? element.definition.type.map(function (type) {
        return type.code
    }) : [element.definition.type.code];

    return codes.map(function (code) {
        var key = path.leaf().replace('[x]', code[0].toUpperCase() + code.slice(1));
        var value = types[code];

        if (element.definition.max === '*') {
            value = [value];
        }

        return {
            key: key,
            value: value
        };
    });
};

module.exports.makeLeaf = function (element, valueSetDictionary) {
    function hasBinding(element){
        return element.definition.binding !== undefined;
    }

    function boundToReferenceResource(element){
        return element.definition.binding.referenceResource !== undefined;
    }

    var path = parsePath(element.path);
    var value = types[element.definition.type.code];
    if (hasBinding(element) && boundToReferenceResource(element)) {
            var valueSet = valueSetDictionary[element.definition.binding.referenceResource.reference];
            if (valueSet) {
                var enumeratedValues = makeEnumFromValueSet(valueSet);

                if (value === types.CodeableConcept){
                    //TODO: enumeratedValues;
                    value.coding[0].code = { type: types.code };
                }
                else {
                    value = {type: value, enum: enumeratedValues}
                }
            }
            else {
                throw new Error('Unknown ValueSet: ' + element.definition.binding.referenceResource.reference);
            }
    }

    if (element.definition.max === '*') {
        value = [value];
    }

    return {
        key: path.leaf(),
        value: value
    };
}
;