module.exports.make = function (docs, title, link) {
    var bundle = {
        resourceType: 'Bundle',
        title: title,
        link: link,
        entry: []
    };
    docs.forEach(function (doc) {
        var entry = {
            id: doc.meta.id,
            link: [{
                rel: 'self',
                href: doc.resource.resourceType + '/' + doc.meta.id + '/_history/' + doc.meta.versionId
            }]
        };

        if (doc.meta.deleted) {
            entry.deleted = doc.meta.deleted;
        } else {
            entry.updated = doc.meta.lastUpdated;
            entry.category = doc.tags || [];
            entry.content = doc.resource;
        }

        bundle.entry.push(entry);

    });
    return bundle;
};