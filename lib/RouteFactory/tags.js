module.exports.getCategoryHeader = function (tags) {
    if (!tags) return '';

    function makeEntry(tag) {
        var entry = tag.term + '; scheme="' + tag.scheme + '"';
        entry = tag.label ? entry + '; label="' + tag.label + '"': entry;
        return entry;
    }

    return tags
        .map(makeEntry)
        .join(',');
};

module.exports.getTagList = function (tags) {
    return {
        resourceType: 'TagList',
        category: tags || []
    }
};