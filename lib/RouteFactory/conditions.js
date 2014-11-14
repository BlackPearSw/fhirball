var conditionFuncs = require('./conditionFuncs');

module.exports.make = function (query, searchParam) {
    var conditions = {};

    for (term in query) {
        if (query.hasOwnProperty(term)) {
            var condition = conditionFuncs.makeCondition(searchParam, query, term);
            if (condition) {
                conditions.$and = conditions.$and || [];
                conditions.$and.push(condition);
            }
        }
    }

    return conditions;
};