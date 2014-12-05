module.exports.reduceToPipeline = function(ops){
    var stages = [];

    //filter
    ops.match.forEach(function(op){
        stages.push({$match: op});
    });

    //sort
    ops.sort.forEach(function(op){
        stages.push({$sort: op});
    });

    //page
    stages.push({$skip: ops.paging.count * (ops.paging.page - 1)});
    stages.push({$limit: ops.paging.count});

    return stages;
};