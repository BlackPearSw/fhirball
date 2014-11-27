//polyfill String.contains
if (!String.prototype.contains) {
    String.prototype.contains = function () {
        return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
}

module.exports.getPage = function(req){
    return Number(req.query['page']) || 1;
};
module.exports.getRestriction = function(page, page_size){
    if (!page) throw new Error('page undefined');
    if (page < 0) throw new Error('page must be a positive number');

    if (!page_size) throw new Error('page_size undefined');
    if (page_size < 0) throw new Error('page_size must be a positive number');

    return {
        skip: (page - 1) * page_size,
        limit: page_size
    }
};
module.exports.getLink = function(req, more){
    function getHref(req) {
        return req.protocol + '://' + req.headers.host + req.originalUrl;
    }

    var page = exports.getPage(req);
    var queryParamString = 'page=' + page;
    var otherParamsExist = req.originalUrl.contains('=');
    var delimiter = otherParamsExist ? '&' : '?';
    var self = req.originalUrl.contains(queryParamString) ? getHref(req) : getHref(req) + delimiter + queryParamString;

    var link = [];
    link.push({rel: 'self', href: self});

    if (page > 1){
        var previous = self.replace(queryParamString, 'page=' + (page - 1));
        link.push({rel: 'previous', href: previous});
    }

    if (more) {
        var next = self.replace(queryParamString, 'page=' + (page + 1));
        link.push({rel: 'next', href: next});
    }

    return link;
};