var conditionFuncs = require('./conditionFuncs');

module.exports.make = function (query, searchParam) {
    var conditions = {};

    for (term in query) {
        if (query.hasOwnProperty(term)) {
            var condition = conditionFuncs.makeCondition(searchParam, query, term);
            conditions.$and = conditions.$and || [];
            conditions.$and.push(condition);
        }
    }

    return conditions;
};