var conditionFuncs = require('./conditionFuncs');

function indexesForString(searchParam) {
    function indexForString(path) {
        var dbPath = conditionFuncs.getDbPath(path);
        var index = {};
        index[dbPath] = 1;
        return index;
    }

    return searchParam.document.path.map(indexForString);
}

function indexesForToken(searchParam) {
    function indexForToken(path) {
        var dbPath = conditionFuncs.getDbPath(path);
        var sysPath = conditionFuncs.getSystemPath(dbPath);
        var index = {};
        index[dbPath] = 1;
        index[sysPath] = 1;
        return index;
    }

    return searchParam.document.path.map(indexForToken);
}

function indexesForTag() {
    return [
        {'tags.term' : 1, 'tags.scheme' : 1}
    ];
}

function indexesUndefined(searchParam) {
    return [];
}

var fnMakeIndex = {
    date: indexesForString,
    string: indexesForString,
    token: indexesForToken,
    tag: indexesForTag,
    profile: indexesUndefined,
    security: indexesUndefined
};

exports.makeIndexes = function (searchParam) {
    var fn = fnMakeIndex[searchParam.type];
    if (!fn) throw new Error('searchParam type unknown');

    return fn(searchParam);
};
