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
            content: doc.resource
        };

        bundle.entry.push(entry);

    });
    return bundle;
};