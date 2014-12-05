var indexes = require('../../../../lib/RouteFactory/search/indexes');

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
                        },
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-index',
                            valueBoolean: true
                        }
                    ]
                };

                var result = indexes.makeIndexes(searchParam);

                should.exist(result);
                result.should.deep.equal([
                    {'resource.foo.name': 1}
                ]);
            });

            it('should return array of indexes for HumanName', function () {
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
                            valueString: 'HumanName'
                        },
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-index',
                            valueBoolean: true
                        }
                    ]
                };

                var result = indexes.makeIndexes(searchParam);

                should.exist(result);
                result.should.deep.equal([
                    {'resource.foo.name.family': 1},
                    {'resource.foo.name.given': 1}
                ]);
            });

            it('should return array of indexes for Address', function () {
                var searchParam = {
                    name: 'address',
                    type: 'string',
                    extension: [
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-path',
                            valueString: 'Foo.foo.address'
                        },
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-contentType',
                            valueString: 'Address'
                        },
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-index',
                            valueBoolean: true
                        }
                    ]
                };

                var result = indexes.makeIndexes(searchParam);

                should.exist(result);
                result.should.deep.equal([
                    {'resource.foo.address.line': 1},
                    {'resource.foo.address.city': 1},
                    {'resource.foo.address.state': 1},
                    {'resource.foo.address.zip': 1},
                    {'resource.foo.address.country': 1}
                ]);
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

                var result = indexes.makeIndexes(searchParam);

                should.exist(result);
                result.should.deep.equal([
                    {'resource.identifier.value': 1, 'resource.identifier.system': 1},
                    {'resource.identifier.label': 1}
                ]);
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

                var result = indexes.makeIndexes(searchParam);

                should.exist(result);
                result.should.deep.equal([
                    {'resource.concept.coding.code': 1, 'resource.concept.coding.system': 1},
                    {'resource.concept.label': 1}
                ]);
            });
        });
    });

    describe('decorateResource', function () {

        it('should throw exception if pojo undefined', function () {
            should.Throw(function () {
                indexes.decorate();
            });
        });

        it('should throw exception if searchParams undefined', function () {
            should.Throw(function () {
                indexes.decorate({});
            });
        });

        it('should throw exception if searchParams is not an Array', function () {
            should.Throw(function () {
                indexes.decorate({}, {});
            });
        });

        it('should add an uppercase string to index', function () {
            var searchParam = [
                {
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
                        },
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-index',
                            valueBoolean: true
                        }
                    ]
                }
            ];

            var pojo = {
                resource: {
                    resourceType: 'Foo',
                    foo: {
                        name: 'IamAname',
                        value: 'IamAvalue'
                    }
                }
            };

            var result = indexes.decorate(pojo, searchParam);

            should.exist(result);
            should.exist(result.index);
            result.index.should.deep.equal({foo: { name: 'IAMANAME'}});
        });

        it('should not add index field when no extension defined', function () {
            var searchParam = [
                {
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
                }
            ];

            var pojo = {
                resource: {
                    resourceType: 'Foo'
                }
            };

            var result = indexes.decorate(pojo, searchParam);

            should.exist(result);
            should.not.exist(result.index);
        });

        it('should add uppercase strings to indexes when contentType is HumanName', function () {
            var searchParam = [
                {
                    name: 'name',
                    type: 'string',
                    extension: [
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-path',
                            valueString: 'Foo.foo.name'
                        },
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-contentType',
                            valueString: 'HumanName'
                        },
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-index',
                            valueBoolean: true
                        }
                    ]
                }
            ];

            var pojo = {
                resource: {
                    resourceType: 'Foo',
                    foo: {
                        name: {
                            family: 'Kent',
                            given: 'Clark'
                        }
                    }
                }
            };

            var result = indexes.decorate(pojo, searchParam);

            should.exist(result);
            should.exist(result.index);
            result.index.should.deep.equal({foo: { name: { family: 'KENT', given: 'CLARK'}}});
        });

        it.skip('should add index field when path includes an array of HumanName', function () {
            var searchParam = [
                {
                    name: 'name',
                    type: 'string',
                    extension: [
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-path',
                            valueString: 'Foo.foo.name'
                        },
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-contentType',
                            valueString: 'HumanName'
                        },
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-index',
                            valueBoolean: true
                        }
                    ]
                }
            ];

            var pojo = {
                resource: {
                    resourceType: 'Foo',
                    foo: {
                        name: [
                            {
                                family: 'Kent',
                                given: 'Clark'
                            },
                            {
                                family: 'Man',
                                given: 'Super'
                            }
                        ]
                    }
                }
            };

            var result = indexes.decorate(pojo, searchParam);

            should.exist(result);
            should.exist(result.index);
            result.index.should.deep.equal({foo: { name: [
                {family: 'KENT', given: 'CLARK'},
                {family: 'MAN', given: 'SUPER'}
            ]}});
        });
    });
});

