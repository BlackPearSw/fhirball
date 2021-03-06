const config = require('./config');
const extension = require('./extension');
const parameters = require('./parameters');
const jsoq = require('../../jsoq');
const async = require('async');

function makeIndex(extension, options) {
    const result = [];
    if (options.index) {

        let def = options.index;
        if (def === true) {
            def = [''];
        }

        def = Array.isArray(def) ? def : [def];

        def.forEach(function (item) {
            const index = {'enable': extension.index, 'columns': {}};
            const fields = Array.isArray(item) ? item : [item]; //define array of fields for index
            fields.forEach(function (field) {
                const dbPath = extension.isStringSearch
                    ? parameters.getPathInSearch(extension.path + field)
                    : parameters.getPathInResource(extension.path + field);
                index.columns[dbPath] = 1;
            });
            result.push(index);
        })
    }

    if (options.modifier) {
        for (const m in options.modifier) {
            if (options.modifier.hasOwnProperty(m)) {
                makeIndex(extension, options.modifier[m])
                    .forEach(function (item) {
                        result.push(item);
                    })
            }
        }
    }

    return result;
}

function makeIndexes(param) {
    const document = extension.getDocument(param);
    const options = config[param.type][document.contentType];
    return options ? makeIndex(document, options) : [];
}

function makeDefaultIndexes() {
    return [
        {'enable': true, 'columns': {'_id': 1}},
        {'enable': true, 'columns': {'tags.term': 1, 'tags.scheme': 1}},
        {'enable': true, 'columns': {'meta.lastUpdated': 1}}
    ];
}

function ensureIndexes(model, searchParam) {

    if (searchParam.length === 0)
        return;

    let indexes = makeDefaultIndexes();

    searchParam.forEach(function (search) {
        indexes = indexes.concat(makeIndexes(search));
    });

    async.eachSeries(indexes, function (index, callback) {

        if (index.enable) {
            model.collection.createIndex(index.columns, callback);
        }
        else {
            model.collection.dropIndex(index.columns, callback);
        }
    }, function (err) {
        if ((err) && (err.message.indexOf("can't find index with key") === -1))
            throw new Error(err)
    });
}

function ensureIndexesForHistory(model) {
    const indexes = [{'meta.id': 1, 'meta.versionId': 1}];

    async.eachSeries(indexes, function (index, callback) {
            model.collection.createIndex(index, callback);
        }
    );
}

const denormaliseFn = {
    string: function (document) {
        return [document];
    },
    'HumanName': function (document) {
        return config.string.HumanName.index
            .map(function (item) {
                return {
                    path: document.path + item,
                    contentType: document.contentType,
                    index: document.index
                }
            });
    },
    'Address': function (document) {
        return config.string.Address.index
            .map(function (item) {
                return {
                    path: document.path + item,
                    contentType: document.contentType,
                    index: document.index
                }
            });
    }
};

function denormalise(document) {
    const fn = denormaliseFn[document.contentType];
    return fn ? fn(document) : [];
}

function doUpperCase(data) {
    if (Array.isArray(data)) {
        return data.map(function (item) {
            return item.toUpperCase();
        });
    }

    return data.toUpperCase();
}

function decoratePojoWithSearchProperties(pojo, searchParam) {
    if (!pojo) {
        throw new Error('pojo undefined')
    }

    if (!searchParam) {
        throw new Error('searchParam undefined')
    }

    if (!Array.isArray(searchParam)) {
        throw new Error('searchParam must be an array of searchParam')
    }

    searchParam
        .map(function (param) {
            return extension.getDocument(param);
        })
        .filter(function (doc) {
            return (doc.isStringSearch);
        })
        .reduce(function (prev, doc) {
            denormalise(doc)
                .forEach(function (doc) {
                    prev.push(doc);
                });
            return prev;
        }, [])
        .forEach(function (doc) {
            const path = parameters.getPathInResource(doc.path);
            const searchPath = parameters.getPathInSearch(doc.path);
            const value = jsoq(pojo).get(path);

            if (value) {
                jsoq(pojo).put(searchPath, doUpperCase(value));
            }
        });

    return pojo;
}

exports.makeDefaultIndexes = makeDefaultIndexes;
exports.makeIndexes = makeIndexes;
exports.ensure = ensureIndexes;
exports.ensureForHistory = ensureIndexesForHistory;
exports.decorate = decoratePojoWithSearchProperties;