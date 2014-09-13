module.exports.make = function(docs, title, link_self) {
    var bundle = {
        resourceType: 'Bundle',
        title: title,
        link: [
            {
                rel: 'self',
                href: link_self
            }
        ],
        totalResults: docs.length,
        entry: []
    };
    docs.forEach(function (doc) {
        var entry = {
            content: doc
        };

        bundle.entry.push(entry);

    });
    return bundle;
};