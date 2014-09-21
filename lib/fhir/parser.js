var libxml = require('libxmljs');

var NAMESPACES = {fhir: 'http://hl7.org/fhir'};

function parse(node) {
    function isLeaf(node) {
        return node.attr('value') !== null;
    }

    function isHtml(node) {
        return node.name() === 'div';
    }

    if (isLeaf(node)) {
        return node.attr('value').value();
    }
    else if (isHtml(node)) {
        var html = node.child(0);
        return html !== null ? html.toString() : '';
    }
    else {
        var obj = {};
        node.childNodes()
            .filter(function (item) {
                return item.name() != 'text' || item.child(0);
            })
            .forEach(function (item) {
                var name = item.name();
                var child = parse(item);
                if (obj[name]) {
                    if (!Array.isArray(obj[name])) {
                        obj[name] = [obj[name]];
                    }
                    obj[name].push(child);
                }
                else {
                    obj[name] = child;
                }
            });
        return obj;
    }
}

module.exports.fromXml = function (xml) {
    var doc = libxml.parseXml(xml);
    var obj = parse(doc.root());
    obj.resourceType = doc.root().name();
    return obj;
};
