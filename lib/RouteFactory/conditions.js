var conditionFuncs = require('./conditionFuncs');

module.exports.make = function (query, searchParam) {
    var conditions = {};

    for (term in query) {
        if (query.hasOwnProperty(term)) {
            conditionFuncs.addCondition(conditions, searchParam, query, term);
        }
    }

    return conditions;
};