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
                    {'columns': {'search.foo.name': 1}, 'enable':true}
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
                    {'columns': {'search.foo.name.family': 1}, 'enable':true},
                    {'columns': {'search.foo.name.given': 1}, 'enable':true}
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
                    {'columns': {'search.foo.address.line': 1}, 'enable':true},
                    {'columns': {'search.foo.address.city': 1}, 'enable':true},
                    {'columns': {'search.foo.address.state': 1}, 'enable':true},
                    {'columns': {'search.foo.address.zip': 1}, 'enable':true},
                    {'columns': {'search.foo.address.country': 1}, 'enable':true}
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
                    {'columns': {'resource.identifier.value': 1, 'resource.identifier.system': 1}, enable: false},
                    {'columns': {'resource.identifier.label': 1}, enable: false}
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
                    {'columns': {'resource.concept.coding.code': 1, 'resource.concept.coding.system': 1}, enable: false},
                    {'columns': {'resource.concept.text': 1}, enable: false}
                ]);
            });
        });

        describe('for reference parameter', function () {
            it('should return array of indexes when path is reference', function () {
                var searchParam = {
                    name: 'name',
                    type: 'reference',
                    target: ['Patient'],
                    extension: [
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-path',
                            valueString: 'Foo.aReference'
                        },
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-contentType',
                            valueString: 'reference'
                        }
                    ]
                };

                var result = indexes.makeIndexes(searchParam);

                should.exist(result);
                result.should.deep.equal([
                    {'columns': {'resource.aReference.reference': 1}, enable: false}
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

        it('should add an uppercase string to search', function () {
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
            should.exist(result.search);
            result.search.should.deep.equal({foo: {name: 'IAMANAME'}});
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
            should.not.exist(result.search);
        });

        it('should not add index field when type is reference', function () {
            var searchParam = [{
                name: 'name',
                type: 'reference',
                target: ['Patient'],
                extension: [
                    {
                        url: 'http://fhirball.com/fhir/Conformance#search-path',
                        valueString: 'Foo.aReference'
                    },
                    {
                        url: 'http://fhirball.com/fhir/Conformance#search-contentType',
                        valueString: 'reference'
                    }
                ]
            }];

            var pojo = {
                resource: {
                    resourceType: 'Foo'
                }
            };

            var result = indexes.decorate(pojo, searchParam);

            should.exist(result);
            should.not.exist(result.search);
        });

        it('should add uppercase strings to search when contentType is HumanName', function () {
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
            should.exist(result.search);
            result.search.should.deep.equal({foo: {name: {family: 'KENT', given: 'CLARK'}}});
        });

        it('should add correct string search field when path includes an array of HumanName', function () {
            var searchParam = [
                {
                    name: 'family',
                    type: 'string',
                    extension: [
                        {
                            url: 'http://fhirball.com/fhir/Conformance#search-path',
                            valueString: 'Foo.foo.name.family'
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
                        name: [
                            {
                                prefix: ['Mr', 'Mister'],
                                family: ['Kent'],
                                given: ['Clark', 'Joseph']
                            },
                            {
                                prefix: ['Hero'],
                                family: ['Man', 'Boy'],
                                given: ['Super']
                            },
                            {
                                family: ['El'],
                                given: ['Kal']
                            }
                        ]
                    }
                }
            };

            var result = indexes.decorate(pojo, searchParam);

            should.exist(result);
            should.exist(result.search);
            result.search.should.deep.equal({
                foo: {
                    name: {
                        family: ['KENT', 'MAN', 'BOY', 'EL']
                    }
                }
            });
        });

        it('should add multiple array index fields when path is HumanName', function () {
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
                                prefix: ['Mr', 'Mister'],
                                family: ['Kent'],
                                given: ['Clark', 'Joseph']
                            },
                            {
                                prefix: ['Hero'],
                                family: ['Man', 'Boy'],
                                given: ['Super']
                            },
                            {
                                family: ['El'],
                                given: ['Kal']
                            }
                        ]
                    }
                }
            };

            var result = indexes.decorate(pojo, searchParam);

            should.exist(result);
            should.exist(result.search);
            result.search.should.deep.equal({
                foo: {
                    name: {
                        family: ['KENT', 'MAN', 'BOY', 'EL'],
                        given: ['CLARK', 'JOSEPH', 'SUPER', 'KAL']
                    }
                }
            });
        });

        it('should not add search index if type is not string', function () {
            var searchParam = [
                {
                    name: 'name',
                    type: 'token',
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
                                prefix: ['Mr', 'Mister'],
                                family: ['Kent'],
                                given: ['Clark', 'Joseph']
                            },
                            {
                                prefix: ['Hero'],
                                family: ['Man', 'Boy'],
                                given: ['Super']
                            },
                            {
                                family: ['El'],
                                given: ['Kal']
                            }
                        ]
                    }
                }
            };

            var result = indexes.decorate(pojo, searchParam);

            should.exist(result);
            should.not.exist(result.search);
        });

        it('should add multiple array index fields when path is Address', function () {
            var searchParam = [
                {
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
                }
            ];

            var pojo = {
                resource: {
                    resourceType: 'Foo',
                    foo: {
                        "address": [
                            {
                                "text": "60 The Drive, Hill, Denholme Clough, West Yorkshire, LS18 3VY",
                                "line": ["60 The Drive", "Hill"],
                                "city": "Denholme Clough",
                                "state": "West Yorkshire",
                                "zip": "LS18 3VY"
                            },
                            {
                                "use": "temp",
                                "text": "The University, Newcastle, NE1 1NE",
                                "line": ["The University"],
                                "city": "Newcastle",
                                "zip": "NE1 1NE"
                            },
                        ]
                    }
                }
            };

            var result = indexes.decorate(pojo, searchParam);

            should.exist(result);
            should.exist(result.search);
            result.search.should.deep.equal({
                foo: {
                    address: {
                        line: ['60 THE DRIVE', 'HILL', 'THE UNIVERSITY'],
                        city: ['DENHOLME CLOUGH', 'NEWCASTLE'],
                        country: [],
                        state: ['WEST YORKSHIRE'],
                        zip: ['LS18 3VY', 'NE1 1NE']
                    }
                }
            });
        });

    });
});

