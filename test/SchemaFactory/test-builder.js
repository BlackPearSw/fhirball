var builder = require('./../../lib/SchemaFactory/builder');
var ValueSetDictionary = require('./../../lib/SchemaFactory/ValueSetDictionary');

var settings = require('../settings');
var expect = require('expect.js');
var types = require('./../../lib/fhir/types');

describe('SchemaFactory.builder', function () {
    describe('makeResourceType', function () {
        it('should return a resourceType object', function () {
            var element = {
                path: 'Foo',
                definition: {
                    type: {
                        code: 'Resource'
                    }
                }
            };
            var result = builder.makeResourceType(element);

            expect(result.key).to.be('resourceType');
            expect(result.value.type).to.be(types.string);
            expect(result.value.match.source).to.be('^Foo$');

        });
    });

    describe('makeBranch', function () {
        it('should return a branch object', function () {
            var element = {
                path: 'Foo.branch',
                definition: {
                    min: 1,
                    max: 1
                }
            };
            var result = builder.makeBranch(element);

            expect(result.key).to.be('branch');
            expect(result.value).to.be.an('object');
        });
    });

    describe('makeLeaf', function () {
        var valueSetDictionary = new ValueSetDictionary();

        before(function (done) {
            valueSetDictionary.load(settings.valuesets_path)
                .then(function () {
                    done();
                });
        });


        it('should return a leaf object', function () {
            var element = {
                path: 'Foo.leaf',
                definition: {
                    min: 1,
                    max: 1,
                    type: {
                        code: 'string'
                    }
                }
            };
            var result = builder.makeLeaf(element);

            expect(result.key).to.be('leaf');
            expect(result.value).to.be(types.string);

        });

        it('should return an array for a collection', function () {
            var element = {
                path: 'Foo.leaf',
                definition: {
                    min: 1,
                    max: '*',
                    type: {
                        code: 'string'
                    }
                }
            };
            var result = builder.makeLeaf(element);

            expect(result.key).to.be('leaf');
            expect(result.value).to.be.an('array');
        });

        it('should return a leaf from a nested object', function () {
            var element = {
                path: 'Foo.branch.leaf',
                definition: {
                    min: 1,
                    max: 1,
                    type: {
                        code: 'string'
                    }
                }
            };
            var result = builder.makeLeaf(element);

            expect(result.key).to.be('leaf');
            expect(result.value).to.be(types.string);

        });

        it.skip('should return a leaf bound to a valueset', function () {
            var element = {
                path: 'Foo.leaf',
                definition: {
                    min: 1,
                    max: 1,
                    type: {
                        code: 'code'
                    },
                    binding: {
                        name: 'FooType',
                        referenceResource: {
                            reference: 'http://hl7.org/fhir/vs/foo-type'
                        }
                    }
                }
            };
            var result = builder.makeLeaf(element, valueSetDictionary);

            expect(result.key).to.be('leaf');
            expect(result.value.type).to.be(types.string);
            expect(result.value.enum).to.be.an('array');
            expect(result.value.enum).to.have.length(4);
            expect(result.value.enum[0]).to.be('F');
            expect(result.value.enum[1]).to.be('B');
            expect(result.value.enum[2]).to.be('FB');
            expect(result.value.enum[3]).to.be('UNK');
        });

        it('should return a leaf bound to a Uri', function () {
            var element = {
                path: 'Foo.leaf',
                definition: {
                    min: 1,
                    max: 1,
                    type: {
                        code: 'code'
                    },
                    binding: {
                        name: 'FooType',
                        referenceUri: 'http://tools.ietf.org/html/xyz'
                    }
                }
            };
            var result = builder.makeLeaf(element);

            expect(result.key).to.be('leaf');
            expect(result.value).to.be(types.string);

        });

        it('should throw an error if leaf bound to an unknown valueset', function () {
            var element = {
                path: 'Foo.leaf',
                definition: {
                    min: 1,
                    max: 1,
                    type: {
                        code: 'code'
                    },
                    binding: {
                        name: 'UnknownType',
                        referenceResource: {
                            reference: 'http://hl7.org/fhir/vs/unknown-type'
                        }
                    }
                }
            };
            try {
                builder.makeLeaf(element);
                expect(false).to.be.true();
            }
            catch (err) {
                expect(err).to.be.ok();
            }
        });
    });

    describe('makeEnumFromValueSet', function () {
        it('should make Enum with included codes', function () {
            var valueSet = {
                compose: {
                    include: {
                        code: ['A', 'B', 'C']
                    }
                }
            };

            var result = builder.makeEnumFromValueSet(valueSet);

            expect(result).to.be.ok;
            expect(result).to.be.an('array');
            expect(result).to.have.length(3);
            expect(result[0]).to.be('A');
            expect(result[1]).to.be('B');
            expect(result[2]).to.be('C');
        });

        it('should make Enum from array of included code sets', function () {
            var valueSet = {
                compose: {
                    include: [
                        {
                            code: ['A', 'B', 'C']
                        }
                    ]
                }
            };

            var result = builder.makeEnumFromValueSet(valueSet);

            expect(result).to.be.ok;
            expect(result).to.be.an('array');
            expect(result).to.have.length(3);
            expect(result[0]).to.be('A');
            expect(result[1]).to.be('B');
            expect(result[2]).to.be('C');
        });

        it('should make Enum from array of included code sets with more than one item', function () {
            var valueSet = {
                compose: {
                    include: [
                        {
                            code: ['A', 'B']
                        },
                        {
                            code: ['C']
                        }
                    ]
                }
            };

            var result = builder.makeEnumFromValueSet(valueSet);

            expect(result).to.be.ok;
            expect(result).to.be.an('array');
            expect(result).to.have.length(3);
            expect(result[0]).to.be('A');
            expect(result[1]).to.be('B');
            expect(result[2]).to.be('C');
        });

        it('should make Enum with concepts', function () {
            var valueSet = {
                define: {
                    concept: [
                        {
                            code: 'A'
                        },
                        {
                            code: 'B'
                        },
                        {
                            code: 'C'
                        }
                    ]
                }
            };

            var result = builder.makeEnumFromValueSet(valueSet);

            expect(result).to.be.ok;
            expect(result).to.be.an('array');
            expect(result).to.have.length(3);
            expect(result[0]).to.be('A');
            expect(result[1]).to.be('B');
            expect(result[2]).to.be('C');
        });

    });
});