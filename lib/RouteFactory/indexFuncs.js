var conditionFuncs = require('./conditionFuncs');

function indexesForString(searchParam){
    function indexForString(path){
        var dbPath = conditionFuncs.getDbPath(path);
        var index = {};
        index[dbPath] = 1;
        return index;
    }

    return searchParam.document.path.map(indexForString);
}

function indexesForToken(searchParam){
    function indexForToken(path){
        var dbPath = conditionFuncs.getDbPath(path);
        var sysPath = conditionFuncs.getSystemPath(dbPath);
        var index = {};
        index[dbPath] = 1;
        index[sysPath] = 1;
        return index;
    }

    return searchParam.document.path.map(indexForToken);
}

var fnMakeIndex = {
    string: indexesForString,
    token: indexesForToken
};

exports.makeIndexes = function (searchParam) {
    var fn = fnMakeIndex[searchParam.type];
    if (!fn) throw new Error('searchParam type unknown');

    return fn(searchParam);
};
