exports.getSearchParam = function (searchParams, parameter) {
    return searchParams.reduce(function (prev, item) {
        return item.name === parameter.name ? item : prev;
    }, undefined)
};

exports.getPathInResource = function (path) {
    var tokens = path.split('.');
    if (tokens.length > 1) {
        tokens[0] = 'resource';
    }
    return tokens.join('.');
};

exports.getPathInIndex = function (path) {
    var tokens = path.split('.');
    if (tokens.length > 1) {
        tokens[0] = 'index';
    }
    return tokens.join('.');
};