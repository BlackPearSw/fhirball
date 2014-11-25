exports.parseQueryParam = function (token) {
    var tokens = token.split(':');

    if (tokens.length > 1) {
        if (tokens[1] === '') throw new Error('blank modifier not supported in search');

        return { original: token, name: tokens[0], modifier: tokens[1] };
    } else {
        return { original: token, name: token};
    }
};

exports.parseDate = function (date) {
    var gt = {text: '>', db: '$gt'};
    var gte = {text: '>=', db: '$gte'};
    var lt = {text: '<', db: '$lt'};
    var lte = {text: '<=', db: '$lte'};

    var prefixes = [gt, gte, lt, lte];

    var prefix = prefixes.reduce(function (prev, prefix) {
        return date.indexOf(prefix.text) === 0 ? prefix : prev;
    }, null);

    if (prefix) {
        return { prefix: prefix, date: date.split(prefix.text)[1] }
    }
    else {
        return {date: date}
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

exports.getSystemPath = function (tokenPath) {
    return tokenPath.replace(/code$/, 'system').replace(/value$/, 'system');
};

function conditionsForDate(queryParam, searchParam, date) {
    function conditionForPath(path) {
        var dbPath = exports.getDbPath(path);
        var condition = {};
        if (match.prefix) {
            var term = {};
            term[match.prefix.db] = match.date;
            condition[dbPath] = term;
        }
        else {
            condition[dbPath] = {$regex: '^' + match.date};
        }
        return condition;
    }

    var match = exports.parseDate(date);
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

function conditionsForString(queryParam, searchParam, string) {
    function conditionForPath(path) {
        var dbPath = exports.getDbPath(path);
        //TODO: can we implement as case-insensitive search as per specification?  Need to add .indexes with search values
        var match = queryParam.modifier === 'exact' ? string : {$regex: '^' + string};
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

function conditionsForGeneralTag(queryParam, searchParam, token) {
    return {'tags.term': token, 'tags.scheme': 'http://hl7.org/fhir/tag'};
}

function conditionsForProfileTag(queryParam, searchParam, token) {
    return {'tags.term': token, 'tags.scheme': 'http://hl7.org/fhir/tag/profile'};
}

function conditionsForSecurityTag(queryParam, searchParam, token) {
    return {'tags.term': token, 'tags.scheme': 'http://hl7.org/fhir/tag/security'};
}

var fnMakeCondition = {
    date: conditionsForDate,
    string: conditionsForString,
    token: conditionsForToken,
    tag: conditionsForGeneralTag,
    profile: conditionsForProfileTag,
    security: conditionsForSecurityTag
};

exports.makeCondition = function (searchParams, query, term) {
    var queryParam = exports.parseQueryParam(term);
    var searchParam = exports.getSearchParam(searchParams, queryParam);
    if (!searchParam) return undefined;


    var fn = fnMakeCondition[searchParam.type];
    if (!fn) new Error('searchParam type unknown');

    if (Array.isArray(query[term])) {
        return query[term]
            .map(function (value) {
                return fn(queryParam, searchParam, value);
            })
            .reduce(function(prev, condition){
                prev.$and.push(condition);
                return prev;
            }, {$and:[]});
    }
    else {
        return fn(queryParam, searchParam, query[queryParam.original]);
    }
};
