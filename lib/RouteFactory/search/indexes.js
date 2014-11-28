var extension = require('./extension');
var parameters = require('./parameters');
var async = require('async');

var indexBuilder = [];

indexBuilder['string|string'] = function (param, document) {
    var dbPath = parameters.getDbPath(document.path);
    var index = {};
    index[dbPath] = 1;
    return [ index ]
};

function indexStringVsComplexType(param, document, children) {
    var result = [];
    children.forEach(function (child) {
        var dbPath = parameters.getDbPath(document.path + '.' + child);
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
    var dbPath = parameters.getDbPath(document.path + '.coding.code');
    index[dbPath] = 1;

    dbPath = parameters.getDbPath(document.path + '.coding.system');
    index[dbPath] = 1;

    result.push(index);

    //:text
    index = {};
    dbPath = parameters.getDbPath(document.path + '.label');
    index[dbPath] = 1;

    result.push(index);

    return result;
};

indexBuilder['token|Identifier'] = function (param, document) {
    var result = [];

    var index = {};
    var dbPath = parameters.getDbPath(document.path + '.value');
    index[dbPath] = 1;

    dbPath = parameters.getDbPath(document.path + '.system');
    index[dbPath] = 1;

    result.push(index);

    //:text
    index = {};
    dbPath = parameters.getDbPath(document.path + '.label');
    index[dbPath] = 1;

    result.push(index);

    return result;
};

indexBuilder['token|boolean'] = function (param) {
    //not worth indexing a boolean!
    return [];
};

indexBuilder['date|date'] = function (param, document) {
    var dbPath = parameters.getDbPath(document.path);
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

function ensureIndexes(model, searchParam){
    searchParam
        .forEach(function(search){
            var indexes = makeIndexes(search);
            indexes.concat(makeDefaultIndexes);

            async.eachSeries(indexes, function(index, callback){
                    var document = extension.getDocument(search);

                    if (document.index) {
                        model.collection.ensureIndex(index, callback);
                    }
                    else {
                        model.collection.dropIndex(index, callback);
                    }
                }
            );
        });
};

exports.makeDefaultIndexes = makeDefaultIndexes;
exports.makeIndexes = makeIndexes;
exports.ensure = ensureIndexes;