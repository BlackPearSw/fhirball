var conditionFuncs = require('./../../../lib/RouteFactory/conditionFuncs');

var should = require('chai').should();

describe('conditionFuncs', function () {
    describe('parseParameter', function(){
        it('should parse parameter without modifier', function () {
            var parameter = 'foo';

            var result = conditionFuncs.parseParameter(parameter);

            should.exist(result);
            result.name.should.equal('foo');
            should.not.exist(result.modifier);
        });

        it('should parse parameter with a modifier', function () {
            var parameter = 'foo:bar';

            var result = conditionFuncs.parseParameter(parameter);

            should.exist(result);
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

        it('should throw exception for token with blank namespace', function () {
            var token = '|foo';

            should.Throw(function () {
                var result = conditionFuncs.parseToken(token);
            });
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

    describe('addCondition', function () {
        it('should throw exception when searchParam.type is invalid', function () {
            should.Throw(function () {
                var searchParam = [
                    {
                        name: 'name',
                        type: 'invalid',
                        path: ['Foo.foo.name']
                    }
                ];
                var term = 'name';
                var query = {
                    name: 'bar'
                };

                conditionFuncs.addCondition(conditions, searchParam, query, term);
            });
        });

        describe('for string parameter', function () {
            it('should add condition using $regex', function () {
                var searchParam = [
                    {
                        name: 'name',
                        type: 'string',
                        path: ['Foo.foo.name']
                    }
                ];
                var term = 'name';
                var query = {
                    name: 'bar'
                };

                var conditions = {};
                var result = conditionFuncs.addCondition(conditions, searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({'resource.foo.name': {$regex: 'bar'}});
            });

            it('should add condition using $regex for exact search when modifier :exact', function () {
                var term = 'name:exact';
                var searchParam = [
                    {
                        name: 'name',
                        type: 'string',
                        path: ['Foo.foo.name']
                    }
                ];
                var query = {
                    'name:exact': 'bar'
                };

                var conditions = {};
                var result = conditionFuncs.addCondition(conditions, searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({'resource.foo.name': {$regex: '^bar$'}});
            });

            it('should add condition using $regex ', function () {
                var term = 'name:exact';
                var searchParam = [
                    {
                        name: 'name',
                        type: 'string',
                        path: ['Foo.foo.family', 'Foo.foo.given']
                    }
                ];
                var query = {
                    'name:exact': 'bar'
                };

                var conditions = {};
                var result = conditionFuncs.addCondition(conditions, searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({$or: [{'resource.foo.family': {$regex: 'bar'}}, {'resource.foo.given': {$regex: 'bar'}}]});
            });
        });

        describe('for token parameter', function () {
            it('should add a mongo condition using exact match for a token parameter', function () {
                var searchParam = [
                    {
                        name: 'identifier',
                        type: 'token',
                        path: ['Foo.identifier']
                    }
                ];
                var term = 'identifier';
                var query = {
                    identifier: '12345'
                };

                var conditions = {};
                var result = conditionFuncs.addCondition(conditions, searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({'resource.identifier.value': '12345'});
            });

            it('should add a mongo condition using exact match for a token parameter with a system', function () {
                var searchParam = [
                    {
                        name: 'identifier',
                        type: 'token',
                        path: ['Foo.identifier']
                    }
                ];
                var term = 'identifier';
                var query = {
                    identifier: 'www.hl7.org/fhir/types/identifier|12345'
                };

                var conditions = {};
                var result = conditionFuncs.addCondition(conditions, searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({'resource.identifier.system': 'www.hl7.org/fhir/types/identifier', 'resource.identifier.value': '12345'});
            });

            it('should throw an exception for a token parameter with a blank system', function () {
                should.Throw(function () {
                    var searchParam = [
                        {
                            name: 'identifier',
                            type: 'token',
                            path: ['Foo.identifier']
                        }
                    ];
                    var term = 'identifier';
                    var query = {
                        identifier: '|12345'
                    };

                    var conditions = {};
                    conditionFuncs.addCondition(conditions, searchParam, query, term);
                });
            });
        });
    });
});