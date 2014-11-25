var extension = require('./extension');
var tags = require('../tags');
var conditionFuncs = require('../conditionFuncs');
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
    var path = '_id';

    var def = {};
    def[path] = mongoose.Types.ObjectId(field.value.text);

    return [
        {
            type: 'filter',
            def: def
        }
    ];
};

operationBuilder['_tag'] = function (field) {
    return [
        {
            type: 'filter',
            def: { 'tags.term': field.value.text, 'tags.scheme':'http://hl7.org/fhir/tag'}
        }
    ];
};

operationBuilder['_profile'] = function (field) {
    return [
        {
            type: 'filter',
            def: { 'tags.term': field.value.text, 'tags.scheme':'http://hl7.org/fhir/tag/profile'}
        }
    ];
};

operationBuilder['_security'] = function (field) {
    return [
        {
            type: 'filter',
            def: { 'tags.term': field.value.text, 'tags.scheme':'http://hl7.org/fhir/tag/security'}
        }
    ];
};

operationBuilder['_sort'] = function (field, searchParams) {
    var param = conditionFuncs.getSearchParam(searchParams, { name: field.value.text});
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

operationBuilder['_page'] = function (field) {
    return [
        {
            type: 'paging',
            page: Number(field.value.text)
        }
    ]
};

function filterForString(field, path) {
    var dbPath = conditionFuncs.getDbPath(path);
    //TODO: can we implement as case-insensitive search as per specification?  Need to add .indexes with search values
    var match = field.key.modifier === 'exact' ? field.value.text : {$regex: '^' + field.value.text};
    var filter = {};
    filter[dbPath] = match;
    return filter;
}

operationBuilder['search|string|string'] = function (field, searchParams, document) {
    var param = conditionFuncs.getSearchParam(searchParams, field.key);
    if (!param) {
        return [];
    }

    var ops = [];
    var op = {
        type: 'filter',
        def: filterForString(field, document.path)
    };
    ops.push(op);

    return ops;
};

function searchStringVsComplexType(field, searchParams, document, children) {
    var param = conditionFuncs.getSearchParam(searchParams, field.key);
    if (!param) {
        return [];
    }

    var ops = [];
    var op = {
        type: 'filter',
        def: { $or: []}
    };
    children.forEach(function (child) {
        op.def.$or.push(filterForString(field, document.path + '.' + child));
    });
    ops.push(op);

    return ops;
}

operationBuilder['search|string|Address'] = function (field, searchParams, document) {
    return searchStringVsComplexType(field, searchParams, document, ['line', 'city', 'state', 'zip', 'country']);
};

operationBuilder['search|string|HumanName'] = function (field, searchParams, document) {
    return searchStringVsComplexType(field, searchParams, document, ['family', 'given']);
};

function searchTokenVsCodeableConcept(field, searchParams, document) {
    var param = conditionFuncs.getSearchParam(searchParams, field.key);
    if (!param) {
        return [];
    }

    var ops = [];
    var filter = {};

    if (field.key.modifier === 'text') {
        var dbPathForText = conditionFuncs.getDbPath(document.path + '.text');
        filter[dbPathForText] = {$regex: '^' + field.value.text};
    }
    else {
        var dbPathForCode = conditionFuncs.getDbPath(document.path + '.coding.code');
        filter[dbPathForCode] = field.value.text;

        if (field.value.namespace) {
            var dbPathForCode = conditionFuncs.getDbPath(document.path + '.coding.system');
            filter[dbPathForCode] = field.value.namespace === 'NULL_NAMESPACE' ? null : field.value.namespace;
        }
    }

    var op = {
        type: 'filter',
        def: filter
    };
    ops.push(op);

    return ops;
}

operationBuilder['search|token|CodeableConcept'] = function (field, searchParams, document) {
    return searchTokenVsCodeableConcept(field, searchParams, document);
};

function searchTokenVsIdentifier(field, searchParams, document) {
    var param = conditionFuncs.getSearchParam(searchParams, field.key);
    if (!param) {
        return [];
    }

    var ops = [];
    var filter = {};

    if (field.key.modifier === 'text') {
        var dbPathForText = conditionFuncs.getDbPath(document.path + '.label');
        filter[dbPathForText] = {$regex: '^' + field.value.text};
    }
    else {
        var dbPathForCode = conditionFuncs.getDbPath(document.path + '.value');
        filter[dbPathForCode] = field.value.text;

        if (field.value.namespace) {
            var dbPathForCode = conditionFuncs.getDbPath(document.path + '.system');
            filter[dbPathForCode] = field.value.namespace === 'NULL_NAMESPACE' ? null : field.value.namespace;
        }
    }

    var op = {
        type: 'filter',
        def: filter
    };
    ops.push(op);

    return ops;
}

operationBuilder['search|token|Identifier'] = function (field, searchParams, document) {
    return searchTokenVsIdentifier(field, searchParams, document);
};

operationBuilder['search|token|boolean'] = function (field, searchParams, document) {
    var param = conditionFuncs.getSearchParam(searchParams, field.key);
    if (!param) {
        return [];
    }

    ops = [];
    var filter = {};

    var dbPath = conditionFuncs.getDbPath(document.path);
    filter[dbPath] = field.value.text === 'true';

    var op = {
        type: 'filter',
        def: filter
    };
    ops.push(op);

    return ops;
};

operationBuilder['search|date|date'] = function (field, searchParams, document) {
    var param = conditionFuncs.getSearchParam(searchParams, field.key);
    if (!param) {
        return [];
    }

    ops = [];
    var filter = {};
    var dbPath = conditionFuncs.getDbPath(document.path);

    if (field.value.comparator) {
        var inequality = {};
        inequality[field.value.comparator.db] = field.value.text;
        filter[dbPath] = inequality;
    }
    else {
        filter[dbPath] = {$regex: '^' + field.value.text};
    }

    var op = {
        type: 'filter',
        def: filter
    };
    ops.push(op);

    return ops;
};

operationBuilder['search'] = function (field, searchParams) {
    var param = conditionFuncs.getSearchParam(searchParams, field.key);
    if (!param) {
        return [];
    }

    var document = extension.getDocument(param);

    var fn = operationBuilder['search|' + param.type + '|' + document.contentType];
    if (!fn) {
        return [];
    }

    return fn(field, searchParams, document);
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

module.exports.reduceToOperations = function (query, searchParam) {
    var fields = module.exports.parse(query);

    var initial = {
        filter: [],
        sort: [],
        paging: {count: 10, page: 1}
    };

    function addOperationsForValue(operations, field) {
        makeOperations(field, searchParam)
            .forEach(function (op) {
                addOperation(op, operations);
            });
    }

    function addOperationsForValueArray(operations, field) {
        field.value.forEach(function (value) {
            addOperationsForValue(operations, {
                key: field.key,
                value: value
            });
        });
    }

    return fields.reduce(function (operations, field) {
        if (Array.isArray(field.value)) {
            addOperationsForValueArray(operations, field);

            return operations;
        } else {
            addOperationsForValue(operations, field);

            return operations;
        }
    }, initial);
};

function parseKey(key) {
    var parts = key.split(':');
    return parts.length > 1 ? {name: parts[0], modifier: parts[1], original: key} : {name: key, original: key};
}

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
            result.namespace = parts[0] === '' ? 'NULL_NAMESPACE' : parts[0];
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