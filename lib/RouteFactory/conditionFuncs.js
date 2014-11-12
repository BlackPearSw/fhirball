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
        if (tokens[0] === '') throw new Error('blank namespace not supported in search');

        return { namespace: tokens[0], code: tokens[1] };
    } else {
        return {code: token};
    }
};

exports.getSearchParam = function (searchParams, parameter) {
    return searchParams.reduce(function (prev, item) {
        return item.name === parameter.name ? item : prev;
    })
};

exports.getDbPath = function (path) {
    var tokens = path.split('.');
    if (tokens.length > 1) {
        tokens[0] = 'resource';
    }
    return tokens.join('.');
};

function makeConditionForString(queryParam, searchParam, string) {
    function conditionForPath(path) {
        var dbPath = exports.getDbPath(path);
        //TODO: can we implement as case-insensitive search as per specification?
        var match = queryParam.modifier === 'exact' ? string : {$regex: string};
        var condition = {};
        condition[dbPath] = match;
        return condition;
    }

    var condition = {};
    if (searchParam.path.length > 1) {
        condition.$or = [];
        searchParam.path.forEach(function (path) {
            condition.$or.push(conditionForPath(path));
        });
    }
    else {
        condition = conditionForPath(searchParam.path[0])
    }

    return condition;
}

function makeConditionForToken(queryParam, searchParam, token) {
    var match = exports.parseToken(token);
    var dbCodePath = exports.getDbPath(searchParam.path[0]);
    var condition = {};
    if (match.namespace) {
        var dbSystemPath = dbCodePath.replace(/code$/, 'system').replace(/value$/, 'system');
        condition[dbSystemPath] = match.namespace;
    }
    condition[dbCodePath] = match.code;

    return condition;
}

exports.addCondition = function (conditions, searchParams, query, term) {
    conditions = conditions || {$and: []};
    if (!conditions.$and) {
        conditions.$and = [];
    }

    var condition = {};
    var queryParam = exports.parseQueryParam(term);
    var searchParam = exports.getSearchParam(searchParams, queryParam);
    if (!searchParam) throw new Error('searchParam undefined');

    if (searchParam.type === 'string') {
        condition = makeConditionForString(queryParam, searchParam, query[queryParam.original]);
    }
    else if (searchParam.type === 'token') {
        condition = makeConditionForToken(queryParam, searchParam, query[queryParam.original]);
    }
    else {
        throw new Error('searchParam type unknown');
    }

    conditions.$and.push(condition);
    return conditions;
};
