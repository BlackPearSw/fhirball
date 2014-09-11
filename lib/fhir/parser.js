var libxml = require('libxmljs');

var NAMESPACES = {fhir: 'http://hl7.org/fhir'};

function parse(node){
    function isLeaf(){
        return node.attr('value') !== null;
    }

    if (isLeaf(node)){
        var val = node.attr('value').value();
        return node.attr('value').value();
    }
    else {
        var obj = {};
        node.childNodes()
            .filter(function(item){
                return item.name() != 'text';
            })
            .forEach(function(item){
            var name = item.name();
            var child = parse(item);
            if (obj[name]) {
                if (! Array.isArray(obj[name])){
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

module.exports.fromXml = function(xml){
    var doc = libxml.parseXml(xml);
    var obj = parse(doc.root());
    obj.resourceType = doc.root().name();
    return obj;
};
