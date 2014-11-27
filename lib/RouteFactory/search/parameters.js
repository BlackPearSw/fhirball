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