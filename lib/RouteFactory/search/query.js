var config = require('./config');
var extension = require('./extension');
var tags = require('../tags');
var parameters = require('./parameters');
var mongoose = require('mongoose');

function mapDocumentPathToDbPath(path) {
    var tokens = path.split('.');
    if (tokens.length > 1) {
        tokens[0] = 'resource';
    }
    return tokens.join('.');
}

function mapParamToDbPath(param) {
    var document = extension.getDocument(param);

    return mapDocumentPathToDbPath(document.path);
}

var operationBuilder = [];

operationBuilder['_id'] = function (field) {
    return [
        {
            type: 'match',
            def: {'_id': mongoose.Types.ObjectId(field.value.text)}
        }
    ];
};

operationBuilder['_tag'] = function (field) {
    return [
        {
            type: 'match',
            def: { 'tags.term': field.value.text, 'tags.scheme': 'http://hl7.org/fhir/tag'}
        }
    ];
};

operationBuilder['_profile'] = function (field) {
    return [
        {
            type: 'match',
            def: { 'tags.term': field.value.text, 'tags.scheme': 'http://hl7.org/fhir/tag/profile'}
        }
    ];
};

operationBuilder['_security'] = function (field) {
    return [
        {
            type: 'match',
            def: { 'tags.term': field.value.text, 'tags.scheme': 'http://hl7.org/fhir/tag/security'}
        }
    ];
};

operationBuilder['_sort'] = function (field, searchParams) {
    var param = parameters.getSearchParam(searchParams, { name: field.value.text});
    if (!param) {
        return [];
    }

    var path = mapParamToDbPath(param);

    var def = {};
    def[path] = field.key.modifier === 'desc' ? -1 : 1;

    return [
        {
            type: 'sort',
            def: def
        }
    ];

};

operationBuilder['_count'] = function (field) {
    return [
        {
            type: 'paging',
            count: Number(field.value.text)
        }
    ]
};

operationBuilder['page'] = function (field) {
    return [
        {
            type: 'paging',
            page: Number(field.value.text)
        }
    ]
};

function getMatchForDef(def, path, field) {
    def.modifier = def.modifier || {} ;

    def = def.modifier[field.key.modifier] ? def.modifier[field.key.modifier] : def;
    return def.getMatch(path, field.value);
}

function makeResourceReferenceValue(targets, field){
    var resource;

    if (field.key.modifier) {
        if (targets.indexOf(field.key.modifier) == -1){
            throw new Error('Resource type is not valid for this search');
        } else {
            resource = field.key.modifier;
        }
    }

    if (targets.length == 1) {
        resource = targets[0];
    }
    else {
        throw new Error('Unable to determine resource type for this search (:[type] modifier required)');
    }

    return {key: {}, value: {text: resource + '/' + field.value.text}}
}

operationBuilder['search'] = function (field, searchParams) {
    var param = parameters.getSearchParam(searchParams, field.key);
    if (!param) {
        return []; //todo: should this be exception? Returning empty search array finds all docs
    }

    var searchField = (param.type == 'reference')
        ? makeResourceReferenceValue(param.target, field)
        : field;

    var document = extension.getDocument(param);
    var options = config[param.type][document.contentType];
    return getMatchForDef(options, document.path, searchField);
};

function makeOperations(field, searchParams) {
    var fn = operationBuilder[field.key.name];
    if (!fn) {
        //not a defined key so assume search
        fn = operationBuilder['search'];
    }

    return fn(field, searchParams);
}

function addOperation(op, operations) {
    if (op) {
        if (op.type === 'paging') {
            operations.paging.count = op.count || operations.paging.count;
            operations.paging.page = op.page || operations.paging.page;
        } else {
            operations[op.type].push(op.def);
        }

    }
    return operations;
}

function fieldToString(field) {
    var k = field.key.modifier ? field.key.name + ':' + field.key.modifier : field.key.name;

    var v = field.value.comparator ? field.value.comparator.text : '';
    if (field.value.namespace) {
        v += field.value.namespace === NULL_NAMESPACE ? '|' + field.value.text : field.value.namespace + '|' + field.value.text;
    }
    else {
        v += field.value.text;
    }

    return k + '=' + v;
}

function fieldsToString(fields, paging) {
    var s = '?';
    s += fields
        .filter(function (item) {
            return item.used;
        })
        .filter(function (item){
            return ! (item.key.name === '_count' || item.key.name === 'page');
        })
        .map(function (item) {
            return fieldToString(item);
        }).join('&');

    s += s.length > 1 ? '&' : '';
    s += '_count=' + paging.count + '&page=' + paging.page;
    return s;
}

module.exports.reduceToOperations = function (query, searchParam) {
    var fields = module.exports.parse(query);
    fields = module.exports.denormalise(fields);

    var initial = {
        match: [],
        sort: [],
        paging: {count: 10, page: 1},
        toString: function () {
            return fieldsToString(fields, this.paging);
        }
    };

    function addOperationsForValue(operations, field, rootfield) {
        makeOperations(field, searchParam)
            .forEach(function (op) {
                rootfield.used = true;
                addOperation(op, operations);
            });
    }

    return fields.reduce(function (operations, field) {
        addOperationsForValue(operations, field, field);

        return operations;
    }, initial);
};

function parseKey(key) {
    var parts = key.split(':');
    return parts.length > 1 ? {name: parts[0], modifier: parts[1], original: key} : {name: key, original: key};
}

var NULL_NAMESPACE = 'NULL_NAMESPACE';
exports.NULL_NAMESPACE = NULL_NAMESPACE;

function parseValue(value) {
    if (Array.isArray(value)) {
        return value.map(parseValue);
    }
    else {
        var result = {};
        var text = value;

        var gt = {text: '>', db: '$gt'};
        var gte = {text: '>=', db: '$gte'};
        var lt = {text: '<', db: '$lt'};
        var lte = {text: '<=', db: '$lte'};

        var comparators = [gt, gte, lt, lte];

        var comparator = comparators.reduce(function (prev, comparator) {
            return value.indexOf(comparator.text) === 0 ? comparator : prev;
        }, null);

        if (comparator) {
            result.comparator = comparator;
            text = text.split(comparator.text)[1]
        }

        if (text.indexOf('|') >= 0) {
            var parts = text.split('|');
            result.namespace = parts[0] === '' ? NULL_NAMESPACE : parts[0];
            text = parts[1];
        }

        result.text = text;

        return result;
    }
}

/*
 query is an object with key value pairs

 field = key "=" value
 key = name [":" modifier]
 value = comparator text ["|" suffix]
 comparator = ">" | ">=" | "<" | "<="
 */
function parseQuery(query) {
    var result = [];

    for (field in query) {
        if (query.hasOwnProperty(field)) {
            var item = {
                key: parseKey(field),
                value: parseValue(query[field])
            };

            result.push(item);
        }
    }

    return result;
}

module.exports.parseKey = parseKey;
module.exports.parseValue = parseValue;
module.exports.parse = parseQuery;

module.exports.denormalise = function (fields) {
    return fields.reduce(function (prev, field) {
        if (!Array.isArray(field.value)) {
            prev.push(field);
        } else {
            field.value.forEach(function (value) {
                prev.push({
                    key: field.key,
                    value: value
                });
            })
        }
        return prev;
    }, []);
};