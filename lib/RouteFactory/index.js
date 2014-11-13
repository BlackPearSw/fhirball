var interactions = require('./interactions');

var RouteFactory = function (contentType) {
    this.contentType = contentType;
};

RouteFactory.prototype.make = function (model, operation, params) {
    return interactions[operation](model, this.contentType, params);
};

RouteFactory.prototype.makeConformance = function (conformance) {
    return interactions.conformance(conformance, this.contentType);
};

RouteFactory.prototype.ensureIndex = function (model, params) {

};

module.exports = exports = RouteFactory;