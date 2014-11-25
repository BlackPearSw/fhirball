var extension = require('./search/extension');
var conditionFuncs = require('./conditionFuncs');

var indexBuilder = [];

indexBuilder['string|string'] = function (param, document) {
    var dbPath = conditionFuncs.getDbPath(document.path);
    var index = {};
    index[dbPath] = 1;
    return [ index ]
};

function indexStringVsComplexType(param, document, children) {
    var result = [];
    children.forEach(function (child) {
        var dbPath = conditionFuncs.getDbPath(document.path + '.' + child);
        var index = {};
        index[dbPath] = 1;
        result.push(index);
    });

    return result;
}

indexBuilder['string|Address'] = function (param, document) {
    return indexStringVsComplexType(param, document, ['line', 'city', 'state', 'zip', 'country']);
};

indexBuilder['string|HumanName'] = function (param, document) {
    return indexStringVsComplexType(param, document, ['family', 'given']);
};

indexBuilder['token|CodeableConcept'] = function (param, document) {
    var result = [];

    var index = {};
    var dbPath = conditionFuncs.getDbPath(document.path + '.coding.code');
    index[dbPath] = 1;

    dbPath = conditionFuncs.getDbPath(document.path + '.coding.system');
    index[dbPath] = 1;

    result.push(index);

    //:text
    index = {};
    dbPath = conditionFuncs.getDbPath(document.path + '.label');
    index[dbPath] = 1;

    result.push(index);

    return result;
};

indexBuilder['token|Identifier'] = function (param, document) {
    var result = [];

    var index = {};
    var dbPath = conditionFuncs.getDbPath(document.path + '.value');
    index[dbPath] = 1;

    dbPath = conditionFuncs.getDbPath(document.path + '.system');
    index[dbPath] = 1;

    result.push(index);

    //:text
    index = {};
    dbPath = conditionFuncs.getDbPath(document.path + '.label');
    index[dbPath] = 1;

    result.push(index);

    return result;
};

indexBuilder['token|boolean'] = function (param) {
    //not worth indexing a boolean!
    return [];
};

indexBuilder['date|date'] = function (param, document) {
    var dbPath = conditionFuncs.getDbPath(document.path);
    var index = {};
    index[dbPath] = 1;
    return [ index ]
};

function makeIndexes(param) {
    var document = extension.getDocument(param);
    var fn = indexBuilder[param.type + '|' + document.contentType];
    if (!fn) {
        return [];
    }

    return fn(param, document);
}

function makeDefaultIndexes() {
    return [
        {'_id': 1},
        {'tags.term': 1, 'tags.scheme': 1}
    ];
}

exports.makeDefaultIndexes = makeDefaultIndexes;
exports.makeIndexes = makeIndexes;
