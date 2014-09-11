var builder = require('./../../lib/SchemaFactory/builder');

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
    });
})
;