var indexFuncs = require('../../../../lib/RouteFactory/search/indexes');

var should = require('chai').should();

describe('indexes', function () {
    describe('makeIndexes', function () {
        describe('for string parameter', function () {
            it('should return array of indexes when one document path', function () {
                var searchParam = {
                    name: 'name',
                    type: 'string',
                    extension: [
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-path',
                            valueString: 'Foo.foo.name'
                        },
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-contentType',
                            valueString: 'string'
                        }
                    ]
                };

                var result = indexFuncs.makeIndexes(searchParam);

                should.exist(result);
                result.should.deep.equal([{'resource.foo.name' : 1}]);
            });
        });

        describe('for token parameter', function () {
            it('should return array of indexes when path is Identifier', function () {
                var searchParam = {
                    name: 'name',
                    type: 'token',
                    extension: [
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-path',
                            valueString: 'Foo.identifier'
                        },
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-contentType',
                            valueString: 'Identifier'
                        }
                    ]
                };

                var result = indexFuncs.makeIndexes(searchParam);

                should.exist(result);
                result.should.deep.equal([{'resource.identifier.value' : 1, 'resource.identifier.system' : 1},
                    {'resource.identifier.label': 1}]);
            });

            it('should return array of indexes when path is CodeableConcept', function () {
                var searchParam = {
                    name: 'name',
                    type: 'token',
                    extension: [
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-path',
                            valueString: 'Foo.concept'
                        },
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-contentType',
                            valueString: 'CodeableConcept'
                        }
                    ]
                };

                var result = indexFuncs.makeIndexes(searchParam);

                should.exist(result);
                result.should.deep.equal([{'resource.concept.coding.code' : 1, 'resource.concept.coding.system' : 1},
                    {'resource.concept.label': 1}]);
            });
        });
    });
});

