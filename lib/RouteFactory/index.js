var interactions = require('./interactions');

DEFAULT_CONTENT_TYPE = 'application/json';

var RouteFactory = function (contentType) {
    this.contentType = contentType || DEFAULT_CONTENT_TYPE;
};

RouteFactory.prototype.make = function (model, operation, params) {
    return interactions[operation](model, this.contentType, params);
};

RouteFactory.prototype.makeConformance = function (conformance) {
    return interactions.conformance(conformance, this.contentType);
};

module.exports = exports = RouteFactory;