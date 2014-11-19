module.exports.make = function(docs, title, link) {
    var bundle = {
        resourceType: 'Bundle',
        title: title,
        link: link,
        entry: []
    };
    docs.forEach(function (doc) {
        var entry = {
            id: doc._id,
            category: doc.tags || [],
            content: doc.resource
        };

        bundle.entry.push(entry);

    });
    return bundle;
};