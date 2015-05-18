var EXT_SEARCH_PATH = 'http://fhirball.com/fhir/Conformance#search-path';
var EXT_SEARCH_CONTENTTYPE = 'http://fhirball.com/fhir/Conformance#search-contentType';
var EXT_SEARCH_INDEX = 'http://fhirball.com/fhir/Conformance#search-index';

module.exports.getDocument = function(param){
    var document = { index: false, isStringSearch: param.type === 'string' };

    param.extension.forEach(function(extension){
        if (extension.url === EXT_SEARCH_PATH){
            document.path = extension.valueString;
        }

        if (extension.url === EXT_SEARCH_CONTENTTYPE){
            document.contentType = extension.valueString;
        }

        if (extension.url === EXT_SEARCH_INDEX){
            document.index = extension.valueBoolean;
        }
    });

    return document;
};