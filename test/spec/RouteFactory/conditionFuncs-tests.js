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

    describe('parseDate', function () {
        it('should parse date without prefix', function () {
            var token = '1952-06-12T00:00:00.000Z';

            var result = conditionFuncs.parseDate(token);

            should.exist(result);
            should.not.exist(result.prefix);
            result.date.should.equal('1952-06-12T00:00:00.000Z');
        });

        it('should parse date with > prefix', function () {
            var token = '>1952-06-12T00:00:00.000Z';

            var result = conditionFuncs.parseDate(token);

            should.exist(result);
            result.prefix.text.should.equal('>');
            result.prefix.db.should.equal('$gt');
            result.date.should.equal('1952-06-12T00:00:00.000Z');
        });

        it('should parse date with >= prefix', function () {
                var token = '>=1952-06-12';

                var result = conditionFuncs.parseDate(token);

                should.exist(result);
                result.prefix.text.should.equal('>=');
                result.prefix.db.should.equal('$gte');
                result.date.should.equal('1952-06-12');
        });

        it('should parse date with < prefix', function () {
            var token = '<1952-06-12';

            var result = conditionFuncs.parseDate(token);

            should.exist(result);
            result.prefix.text.should.equal('<');
            result.prefix.db.should.equal('$lt');
            result.date.should.equal('1952-06-12');
        });

        it('should parse date with <= prefix', function () {
            var token = '<=1952-06-12';

            var result = conditionFuncs.parseDate(token);

            should.exist(result);
            result.prefix.text.should.equal('<=');
            result.prefix.db.should.equal('$lte');
            result.date.should.equal('1952-06-12');
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
        });

        it('should return undefined when term does not match a searchParam', function () {
            var searchParam = [
                {name: 'foo'},
                {name: 'bar'}
            ];
            var parameter = {
                page: '3'
            };

            var result = conditionFuncs.getSearchParam(searchParam, parameter);

            should.not.exist(result);
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

    describe('makeCondition', function () {
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

                conditionFuncs.makeCondition(searchParam, query, term);
            });
        });

        it('should return undefined when searchParam undefined', function () {
                var searchParam = [
                    {
                        name: 'name',
                        type: 'invalid',
                        document: {
                            path: ['Foo.foo.name']
                        }
                    }
                ];
                var term = 'page';
                var query = {
                    name: 'bar',
                    page: '3'
                };

            var result = conditionFuncs.makeCondition(searchParam, query, term);

            should.not.exist(result);
        });

        describe('for date parameter', function () {
            it('should return condition using regex to match on partial dates', function () {
                var searchParam = [
                    {
                        name: 'when',
                        type: 'date',
                        document: {
                            path: ['Foo.myDate']
                        }
                    }
                ];
                var term = 'when';
                var query = {
                    when: '1952-06-12T00:00:00.000Z'
                };

                var result = conditionFuncs.makeCondition(searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({'resource.myDate': {$regex: '^1952-06-12T00:00:00.000Z'}});
            });

            it('should return condition using inequality to match when prefix', function () {
                var searchParam = [
                    {
                        name: 'when',
                        type: 'date',
                        document: {
                            path: ['Foo.myDate']
                        }
                    }
                ];
                var term = 'when';
                var query = {
                    when: '>1952-06-12T00:00:00.000Z'
                };

                var result = conditionFuncs.makeCondition(searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({'resource.myDate': {$gt: '1952-06-12T00:00:00.000Z'}});
            });

            it('should return condition when array of values for term', function () {
                var searchParam = [
                    {
                        name: 'when',
                        type: 'date',
                        document: {
                            path: ['Foo.myDate']
                        }
                    }
                ];
                var term = 'when';
                var query = {
                    when: ['>1952', '<1960']
                };

                var result = conditionFuncs.makeCondition(searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({$and: [{'resource.myDate': {$gt: '1952'}}, {'resource.myDate': {$lt: '1960'}}]});
            });
        });


        describe('for string parameter', function () {
            it('should return condition using $regex', function () {
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

                var result = conditionFuncs.makeCondition(searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({'resource.foo.name': {$regex: '^bar'}});
            });


            it('should return condition using equality when modifier :exact', function () {
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

                var result = conditionFuncs.makeCondition(searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({'resource.foo.name': 'bar'});
            });

            it('should return more than one condition using equality when multiple paths', function () {
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

                var result = conditionFuncs.makeCondition(searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({$or: [
                    {'resource.foo.family': 'bar'},
                    {'resource.foo.given': 'bar'}
                ]});
            });
        });

        describe('for token parameter', function () {
            it('should return condition using equality on value', function () {
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
                    identifier: '12345'
                };

                var result = conditionFuncs.makeCondition(searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({'resource.identifier.value': '12345'});
            });

            it('should return condition using equality on value and system', function () {
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

                var result = conditionFuncs.makeCondition(searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({'resource.identifier.system': 'www.hl7.org/fhir/types/identifier', 'resource.identifier.value': '12345'});
            });

            it('should return condition using equality on code', function () {
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

                var result = conditionFuncs.makeCondition(searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({'resource.coded.code': '12345'});
            });

            it('should return condition using equality on code and system', function () {
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

                var result = conditionFuncs.makeCondition(searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({'resource.coded.system': 'www.hl7.org/fhir/types/coded', 'resource.coded.code': '12345'});
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

                var result = conditionFuncs.makeCondition(searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({'resource.identifier.system': null, 'resource.identifier.value': '12345'});
            });
        });

        describe('for _tag parameter', function () {
            it('should return criterion for tag search', function () {
                var searchParam = [
                    {
                        name: '_tag',
                        type: 'tag'
                    }
                ];
                var term = '_tag';
                var query = {
                    _tag: 'http://hl7.org/fhir/tag/needs-review'
                };

                var result = conditionFuncs.makeCondition(searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({'tags.term': 'http://hl7.org/fhir/tag/needs-review', 'tags.scheme': 'http://hl7.org/fhir/tag'});
            });
        });

        describe('for _profile parameter', function () {
            it('should return criterion for profile search', function () {
                var searchParam = [
                    {
                        name: '_profile',
                        type: 'profile'
                    }
                ];
                var term = '_profile';
                var query = {
                    _profile: 'http://hl7.org/fhir/tag/profile/lipid'
                };

                var result = conditionFuncs.makeCondition(searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({'tags.term': 'http://hl7.org/fhir/tag/profile/lipid', 'tags.scheme': 'http://hl7.org/fhir/tag/profile'});
            });
        });

        describe('for _security parameter', function () {
            it('should return criterion for profile search', function () {
                var searchParam = [
                    {
                        name: '_security',
                        type: 'security'
                    }
                ];
                var term = '_security';
                var query = {
                    _security: 'http://hl7.org/fhir/tag/security/celebrity'
                };

                var result = conditionFuncs.makeCondition(searchParam, query, term);

                should.exist(result);
                result.should.deep.equal({'tags.term': 'http://hl7.org/fhir/tag/security/celebrity', 'tags.scheme': 'http://hl7.org/fhir/tag/security'});
            });
        });
    });
});