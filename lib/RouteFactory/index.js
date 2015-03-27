var interactions = require('./interactions');
var indexes = require('./search/indexes');

var RouteFactory = function (contentType) {
    this.contentType = contentType;
};

RouteFactory.prototype.make = function (model, operation, params, auditModel) {
    return interactions[operation](model, this.contentType, params, auditModel);
};

RouteFactory.prototype.makeReadTagsForInstance = function (model) {
    return interactions.readTagsForInstance(model, this.contentType);
};

RouteFactory.prototype.makeCreateTagsForInstance = function (model) {
    return interactions.createTagsForInstance(model, this.contentType);
};

RouteFactory.prototype.makeDeleteTagsForInstance = function (model) {
    return interactions.deleteTagsForInstance(model, this.contentType);
};

RouteFactory.prototype.makeConformance = function (conformance) {
    return interactions.conformance(conformance, this.contentType);
};

RouteFactory.prototype.ensureIndexes = function (model, params) {
    indexes.ensure(model, params);
};

RouteFactory.prototype.ensureIndexesForHistory = function (model, params) {
    indexes.ensureForHistory(model);
};

module.exports = exports = RouteFactory;