var interactions = require('./interactions');

var RouteFactory = function () {

};

RouteFactory.prototype.make = function (model, operation) {
    return interactions[operation](model);
};

RouteFactory.prototype.makeConformance = function (conformance) {
    return interactions.conformance(conformance);
};


module.exports = exports = RouteFactory;