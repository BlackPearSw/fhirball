var indexFuncs = require('./../../../lib/RouteFactory/indexFuncs');

var should = require('chai').should();

describe('indexFuncs', function () {
    describe('makeIndexes', function () {
        it('should throw exception when searchParam.type is invalid', function () {
            should.Throw(function () {
                var searchParam = {
                    name: 'name',
                    type: 'invalidtype',
                    document: {
                        path: ['Foo.foo.name']
                    }
                };

                indexFuncs.makeIndexes(searchParam);
            });
        });

        describe('for string parameter', function () {
            it('should return array of indexes when one document path', function () {
                var searchParam = {
                    name: 'name',
                    type: 'string',
                    document: {
                        path: ['Foo.foo.name']
                    }
                };

                var result = indexFuncs.makeIndexes(searchParam);

                should.exist(result);
                result.should.deep.equal([{'resource.foo.name' : 1}]);
            });

            it('should return array of indexes when more than one document.path', function () {
                var searchParam = {
                    name: 'name',
                    type: 'string',
                    document: {
                        path: ['Foo.foo.family', 'Foo.foo.given']
                    }
                };

                var result = indexFuncs.makeIndexes(searchParam);

                should.exist(result);
                result.should.deep.equal([{'resource.foo.family' : 1}, {'resource.foo.given' : 1}]);
            });
        });

        describe('for token parameter', function () {
            it('should return array of indexes when path is fhir:Identifier', function () {
                var searchParam = {
                    name: 'name',
                    type: 'token',
                    document: {
                        path: ['Foo.identifier.value']
                    }
                };

                var result = indexFuncs.makeIndexes(searchParam);

                should.exist(result);
                result.should.deep.equal([{'resource.identifier.value' : 1, 'resource.identifier.system' : 1}]);
            });

            it('should return array of indexes when path is fhir:Coding', function () {
                var searchParam = {
                    name: 'name',
                    type: 'token',
                    document: {
                        path: ['Foo.coded.code']
                    }
                };

                var result = indexFuncs.makeIndexes(searchParam);

                should.exist(result);
                result.should.deep.equal([{'resource.coded.code' : 1, 'resource.coded.system' : 1}]);
            });
        });
    });
});

