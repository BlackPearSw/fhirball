exports.parseQueryParam = function (token) {
    var tokens = token.split(':');

    if (tokens.length > 1) {
        if (tokens[1] === '') throw new Error('blank modifier not supported in search');

        return { original: token, name: tokens[0], modifier: tokens[1] };
    } else {
        return { original: token, name: token};
    }
};

exports.parseToken = function (token) {
    var tokens = token.split('|');

    if (tokens.length > 1) {
        if (tokens[0] === '') {
            tokens[0] = 'NAMESPACE_NULL';
        }

        return { namespace: tokens[0], code: tokens[1] };
    } else {
        return {code: token};
    }
};

exports.getSearchParam = function (searchParams, parameter) {
    return searchParams.reduce(function (prev, item) {
        return item.name === parameter.name ? item : prev;
    }, undefined)
};

exports.getDbPath = function (path) {
    var tokens = path.split('.');
    if (tokens.length > 1) {
        tokens[0] = 'resource';
    }
    return tokens.join('.');
};

exports.getSystemPath = function(tokenPath) {
    return tokenPath.replace(/code$/, 'system').replace(/value$/, 'system');
};

function conditionsForString(queryParam, searchParam, string) {
    function conditionForPath(path) {
        var dbPath = exports.getDbPath(path);
        //TODO: can we implement as case-insensitive search as per specification?
        var match = queryParam.modifier === 'exact' ? string : {$regex: string};
        var condition = {};
        condition[dbPath] = match;
        return condition;
    }

    var condition = {};
    if (searchParam.document.path.length > 1) {
        condition.$or = [];
        searchParam.document.path.forEach(function (path) {
            condition.$or.push(conditionForPath(path));
        });
    }
    else {
        condition = conditionForPath(searchParam.document.path[0])
    }

    return condition;
}

function conditionsForToken(queryParam, searchParam, token) {
    var match = exports.parseToken(token);
    var dbCodePath = exports.getDbPath(searchParam.document.path[0]);
    var condition = {};
    if (match.namespace) {
        var dbSystemPath = exports.getSystemPath(dbCodePath);
        condition[dbSystemPath] = match.namespace === 'NAMESPACE_NULL' ? null : match.namespace;
    }
    condition[dbCodePath] = match.code;

    return condition;
}

var fnMakeCondition = {
    string: conditionsForString,
    token: conditionsForToken
};

exports.makeCondition = function (searchParams, query, term) {
    var queryParam = exports.parseQueryParam(term);
    var searchParam = exports.getSearchParam(searchParams, queryParam);
    if (!searchParam) return undefined;

    var fn = fnMakeCondition[searchParam.type];
    if (!fn) new Error('searchParam type unknown');

    return fn(queryParam, searchParam, query[queryParam.original]);
};
