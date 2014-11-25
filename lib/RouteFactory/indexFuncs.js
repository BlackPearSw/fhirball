var conditionFuncs = require('./conditionFuncs');

var indexBuilder = [];

indexBuilder['string|string'] = function (param) {
    var dbPath = conditionFuncs.getDbPath(param.document.path);
    var index = {};
    index[dbPath] = 1;
    return [ index ]
};

function indexStringVsComplexType(param, children) {
    var result = [];
    children.forEach(function (child) {
        var dbPath = conditionFuncs.getDbPath(param.document.path + '.' + child);
        var index = {};
        index[dbPath] = 1;
        result.push(index);
    });

    return result;
}

indexBuilder['string|Address'] = function (param) {
    return indexStringVsComplexType(param, ['line', 'city', 'state', 'zip', 'country']);
};

indexBuilder['string|HumanName'] = function (param) {
    return indexStringVsComplexType(param, ['family', 'given']);
};

indexBuilder['token|CodeableConcept'] = function (param) {
    var result = [];

    var index = {};
    var dbPath = conditionFuncs.getDbPath(param.document.path + '.coding.code');
    index[dbPath] = 1;

    dbPath = conditionFuncs.getDbPath(param.document.path + '.coding.system');
    index[dbPath] = 1;

    result.push(index);

    //:text
    index = {};
    dbPath = conditionFuncs.getDbPath(param.document.path + '.label');
    index[dbPath] = 1;

    result.push(index);

    return result;
};

indexBuilder['token|Identifier'] = function (param) {
    var result = [];

    var index = {};
    var dbPath = conditionFuncs.getDbPath(param.document.path + '.value');
    index[dbPath] = 1;

    dbPath = conditionFuncs.getDbPath(param.document.path + '.system');
    index[dbPath] = 1;

    result.push(index);

    //:text
    index = {};
    dbPath = conditionFuncs.getDbPath(param.document.path + '.label');
    index[dbPath] = 1;

    result.push(index);

    return result;
};

indexBuilder['token|boolean'] = function (param) {
    //not worth indexing a boolean!
    return [];
};

indexBuilder['date|date'] = function (param) {
    var dbPath = conditionFuncs.getDbPath(param.document.path);
    var index = {};
    index[dbPath] = 1;
    return [ index ]
};

function makeIndexes(param) {
    var fn = indexBuilder[param.type + '|' + param.document.contentType];
    if (!fn) {
        return [];
    }

    return fn(param);
}

function makeDefaultIndexes() {
    return [
        {'_id': 1},
        {'tags.term': 1, 'tags.scheme': 1}
    ];
}

exports.makeDefaultIndexes = makeDefaultIndexes;
exports.makeIndexes = makeIndexes;
