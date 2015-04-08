module.exports.getCategoryHeader = function (tags) {
    if (!tags) return '';

    function makeEntry(tag) {
        var entry = tag.term + '; scheme="' + tag.scheme + '"';
        entry = tag.label ? entry + '; label="' + tag.label + '"' : entry;
        return entry;
    }

    return tags
        .map(makeEntry)
        .join(',');
};

module.exports.parseCategoryHeader = function (category) {
    var tags = [];

    if (category) {
        tags = category
            .split(',')
            .map(function (item) {
                return item
                    .split(';')
                    .reduce(function (tag, item) {
                        var tokens = item.split('=');
                        if (tokens.length === 1) {
                            tag.term = tokens[0];
                        } else {
                            tag[tokens[0].trim()] = tokens[1].replace(/"/g, '');
                        }
                        return tag;
                    }, {});
            });
    }

    return {
        resourceType: 'TagList',
        category: tags
    }
};

module.exports.getTagList = function (tags) {
    return {
        resourceType: 'TagList',
        category: tags || []
    }
};