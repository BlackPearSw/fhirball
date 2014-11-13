var conditionFuncs = require('./../../../lib/RouteFactory/conditionFuncs');

var should = require('chai').should();

describe('conditionFuncs', function () {
    describe('parseQueryParam', function () {
        it('should parse parameter without modifier', function () {
            var parameter = 'foo';

            var result = conditionFuncs.parseQueryParam(parameter);

            should.exist(result);
            result.original.should.equal('foo');
            result.name.should.equal('foo');
            should.not.exist(result.modifier);
        });

        it('should parse parameter with a modifier', function () {
            var parameter = 'foo:bar';

            var result = conditionFuncs.parseQueryParam(parameter);

            should.exist(result);
            result.original.should.equal('foo:bar');
            result.name.should.equal('foo');
            result.modifier.should.equal('bar');
        });
    });

    describe('parseToken', function () {
        it('should parse token without namespace', function () {
            var token = 'foo';

            var result = conditionFuncs.parseToken(token);

            should.exist(result);
            should.not.exist(result.namespace);
            result.code.should.equal('foo');
        });

        it('should parse token with namespace', function () {
            var token = 'system|foo';

            var result = conditionFuncs.parseToken(token);

            should.exist(result);
            result.namespace.should.equal('system');
            result.code.should.equal('foo');
        });

        it('should parse token with blank namespace', function () {
            var token = '|foo';

            var result = conditionFuncs.parseToken(token);

            should.exist(result);

            result.namespace.should.equal('NAMESPACE_NULL');
            result.code.should.equal('foo');
        });
    });

    describe('getSearchParam', function () {
        it('should find searchParam for a term with a modifier', function () {
            var searchParam = [
                {name: 'foo'},
                {name: 'bar'}
            ];
            var parameter =
            {
                name: 'foo',
                modifier: 'bar'
            };

            var result = conditionFuncs.getSearchParam(searchParam, parameter);

            should.exist(result);
            result.name.should.equal('foo');
        });

        it('should find searchParam for a term', function () {
            var searchParam = [
                {name: 'foo'},
                {name: 'bar'}
            ];
            var parameter = {
                name: 'bar'
            };

            var result = conditionFuncs.getSearchParam(searchParam, parameter);

            should.exist(result);
            result.name.should.equal('bar');
        })
    });

    describe('getDbPath', function () {
        it('should make db path from path', function () {
            var path = 'Foo.bar.name';

            var result = conditionFuncs.getDbPath(path);

            should.exist(result);
            result.should.equal('resource.bar.name');
        });

        it('should make db path for path _id', function () {
            var path = '_id';

            var result = conditionFuncs.getDbPath(path);

            should.exist(result);
            result.should.equal('_id');
        });
    });

    describe('getSystemPath', function () {
        it('should make system path from code path', function () {
            var path = 'resource.bar.code';

            var result = conditionFuncs.getSystemPath(path);

            should.exist(result);
            result.should.equal('resource.bar.system');
        });

        it('should make system path from value path', function () {
            var path = 'resource.bar.value';

            var result = conditionFuncs.getSystemPath(path);

            should.exist(result);
            result.should.equal('resource.bar.system');
        });
    });

    describe('addCondition', function () {
        it('should throw exception when searchParam.type is invalid', function () {
            should.Throw(function () {
                var searchParam = [
                    {
                        name: 'name',
                        type: 'invalid',
                        document: {
                            path: ['Foo.foo.name']
                        }
                    }
                ];
                var term = 'name';
                var query = {
                    name: 'bar'
                };

                var conditions = {};
                conditionFuncs.addCondition(conditions, searchParam, query, term);
            });
        });

        describe('for string parameter', function () {
            it('should add condition using $regex', function () {
                var searchParam = [
                    {
                        name: 'name',
                        type: 'string',
                        document: {
                            path: ['Foo.foo.name']
                        }
                    }
                ];
                var term = 'name';
                var query = {
                    name: 'bar'
                };

                var conditions = {};
                var result = conditionFuncs.addCondition(conditions, searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({$and: [
                    {'resource.foo.name': {$regex: 'bar'}}
                ]});
            });

            it('should add condition using $regex for exact search when modifier :exact', function () {
                var term = 'name:exact';
                var searchParam = [
                    {
                        name: 'name',
                        type: 'string',
                        document: {
                            path: ['Foo.foo.name']
                        }
                    }
                ];
                var query = {
                    'name:exact': 'bar'
                };

                var conditions = {};
                var result = conditionFuncs.addCondition(conditions, searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({$and: [
                    {'resource.foo.name': 'bar'}
                ]});
            });

            it('should add condition using $regex for multiple paths', function () {
                var term = 'name:exact';
                var searchParam = [
                    {
                        name: 'name',
                        type: 'string',
                        document: {
                            path: ['Foo.foo.family', 'Foo.foo.given']
                        }
                    }
                ];
                var query = {
                    'name:exact': 'bar'
                };

                var conditions = {};
                var result = conditionFuncs.addCondition(conditions, searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({$and: [
                    {$or: [
                        {'resource.foo.family': 'bar'},
                        {'resource.foo.given': 'bar'}
                    ]}
                ]});
            });
        });

        describe('for token parameter', function () {
            it('should add a condition using exact match on value for a token parameter', function () {
                var searchParam = [
                    {
                        name: 'identifier',
                        type: 'token',
                        document : {
                            path: ['Foo.identifier.value']
                        }
                    }
                ];
                var term = 'identifier';
                var query = {
                    identifier: '12345'
                };

                var conditions = {};
                var result = conditionFuncs.addCondition(conditions, searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({$and: [
                    {'resource.identifier.value': '12345'}
                ]});
            });

            it('should add a condition using exact match on value for a token parameter with a system', function () {
                var searchParam = [
                    {
                        name: 'identifier',
                        type: 'token',
                        document: {
                            path: ['Foo.identifier.value']
                        }
                    }
                ];
                var term = 'identifier';
                var query = {
                    identifier: 'www.hl7.org/fhir/types/identifier|12345'
                };

                var conditions = {};
                var result = conditionFuncs.addCondition(conditions, searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({$and: [
                    {'resource.identifier.system': 'www.hl7.org/fhir/types/identifier', 'resource.identifier.value': '12345'}
                ]});
            });

            it('should add a condition using exact match on code for a token parameter', function () {
                var searchParam = [
                    {
                        name: 'coded',
                        type: 'token',
                        document: {
                            path: ['Foo.coded.code']
                        }
                    }
                ];
                var term = 'coded';
                var query = {
                    coded: '12345'
                };

                var conditions = {};
                var result = conditionFuncs.addCondition(conditions, searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({$and: [
                    {'resource.coded.code': '12345'}
                ]});
            });

            it('should add a condition using exact match on code for a token parameter with a system', function () {
                var searchParam = [
                    {
                        name: 'coded',
                        type: 'token',
                        document: {
                            path: ['Foo.coded.code']
                        }
                    }
                ];
                var term = 'coded';
                var query = {
                    coded: 'www.hl7.org/fhir/types/coded|12345'
                };

                var conditions = {};
                var result = conditionFuncs.addCondition(conditions, searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({$and: [
                    {'resource.coded.system': 'www.hl7.org/fhir/types/coded', 'resource.coded.code': '12345'}
                ]});
            });

            it('should add a condition for a token parameter with a blank system', function () {
                var searchParam = [
                    {
                        name: 'identifier',
                        type: 'token',
                        document: {
                            path: ['Foo.identifier.value']
                        }
                    }
                ];
                var term = 'identifier';
                var query = {
                    identifier: '|12345'
                };

                var conditions = {};
                var result = conditionFuncs.addCondition(conditions, searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({$and: [
                    {'resource.identifier.system': null, 'resource.identifier.value': '12345'}
                ]});
            });
        });
    });
});