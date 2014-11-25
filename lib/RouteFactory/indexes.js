var extension = require('./search/extension');
var indexFuncs = require('./indexFuncs');
var async = require('async');

exports.ensure = function(model, searchParam){
    searchParam
        .forEach(function(search){
        var indexes = indexFuncs.makeIndexes(search);
        indexes.concat(indexFuncs.makeDefaultIndexes);

        async.eachSeries(indexes, function(index, callback){
                var document = extension.getDocument(search);

                if (document.index) {
                    model.collection.ensureIndex(index, callback);
                }
                else {
                    model.collection.dropIndex(index, callback);
                }
            }
        );
    });
};