exports.parseParameter = function (token) {
    var tokens = token.split(':');

    if (tokens.length > 1) {
        if (tokens[1] === '') throw new Error('blank modifier not supported in search');

        return { name: tokens[0], modifier: tokens[1] };
    } else {
        return { name: token};
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

exports.addCondition = function (conditions, searchParams, query, term) {
    conditions = conditions || {};

    var parameter = exports.parseParameter(term);
    var searchParam = exports.getSearchParam(searchParams, parameter);
    if (!searchParam) throw new Error('searchParam undefined');
    searchParam.path.forEach(function(path){
        var dbPath = exports.getDbPath(searchParam.path[0]);

        if (searchParam.type === 'string') {
            //TODO: can we implement as case-insensitive search as per specification?
            conditions[dbPath] = parameter.modifier === 'exact' ? {$regex: '^' + query[ term] + '$'} : {$regex: query[term]};
        }
        else if (searchParam.type === 'token') {
            var match = exports.parseToken(query[term]);
            if (match.namespace) {
                conditions[dbPath + '.system'] = match.namespace;
            }
            conditions[dbPath + '.value'] = match.code;
        }
        else {
            throw new Error('searchParam type unknown');
        }
    });

    return conditions;
};
