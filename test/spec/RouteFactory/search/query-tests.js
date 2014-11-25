var query = require('./../../../../lib/RouteFactory/search/query');

var should = require('chai').should();

//TODO: Need matrix of allowed search params vs options

describe('query', function () {
    describe('parseKey', function () {
        it('should return name when no modifier', function () {
            var key = 'foo';

            var result = query.parseKey(key);

            should.exist(result);
            result.name.should.equal('foo');
            should.not.exist(result.modifier);
            result.original.should.equal('foo');
        });

        it('should return name and modifier when modifier present', function () {
            var key = 'foo:bar';

            var result = query.parseKey(key);

            should.exist(result);
            result.name.should.equal('foo');
            result.modifier.should.equal('bar');
            result.original.should.equal('foo:bar');
        });
    });

    describe('parseValue', function () {
        it('should return text when no comparator/suffix', function () {
            var value = 'fooval';

            var result = query.parseValue(value);

            should.exist(result);
            result.text.should.equal('fooval');
            should.not.exist(result.comparator);
        });

        it('should return text and comparator when comparator > and no suffix', function () {
            var value = '>fooval';

            var result = query.parseValue(value);

            should.exist(result);
            result.text.should.equal('fooval');
            result.comparator.should.deep.equal({text: '>', db: '$gt'});
        });

        it('should return text and comparator when comparator >= and no suffix', function () {
            var value = '>=fooval';

            var result = query.parseValue(value);

            should.exist(result);
            result.text.should.equal('fooval');
            result.comparator.should.deep.equal({text: '>=', db: '$gte'});
        });

        it('should return text and comparator when comparator < and no suffix', function () {
            var value = '<fooval';

            var result = query.parseValue(value);

            should.exist(result);
            result.text.should.equal('fooval');
            result.comparator.should.deep.equal({text: '<', db: '$lt'});
        });

        it('should return text and comparator when comparator <= and no suffix', function () {
            var value = '<=fooval';

            var result = query.parseValue(value);

            should.exist(result);
            result.text.should.equal('fooval');
            result.comparator.should.deep.equal({text: '<=', db: '$lte'});
        });

        it('should return text and namespace', function () {
            var value = 'mySystem|myCode';

            var result = query.parseValue(value);

            should.exist(result);
            result.namespace.should.equal('mySystem');
            result.text.should.equal('myCode');
        });

        it('should return text and null namespace when not supplied', function () {
            var value = '|myCode';

            var result = query.parseValue(value);

            should.exist(result);
            result.namespace.should.equal('NULL_NAMESPACE');
            result.text.should.equal('myCode');
        });
    });

    describe('parse', function () {
        it('should parse empty query', function () {
            var input = {};

            var result = query.parse(input);

            should.exist(result);
            result.should.be.an('Array');
        });

        it('should parse populated query', function () {
            var input = {
                foo: '1',
                bar: '2'
            };

            var result = query.parse(input);

            should.exist(result);
            result.should.be.an('Array');
            result.should.deep.equal([
                {key: {name: 'foo', original: 'foo'}, value: {text: '1'}},
                {key: {name: 'bar', original: 'bar'}, value: {text: '2'}}
            ]);
        });

        it('should parse query including array', function () {
            var input = {
                foo: '1',
                bar: ['2', '3', '4']
            };

            var result = query.parse(input);

            should.exist(result);
            result.should.be.an('Array');
            result.should.deep.equal([
                {key: {name: 'foo', original: 'foo'}, value: {text: '1'}},
                {key: {name: 'bar', original: 'bar'}, value: [
                    {text: '2'},
                    {text: '3'},
                    {text: '4'}
                ]}
            ]);
        });

        it('should parse field with modifier', function () {
            var input = {
                'foo:mod': '1'
            };

            var result = query.parse(input);

            should.exist(result);
            result.should.be.an('Array');
            result.should.deep.equal([
                {key: {name: 'foo', modifier: 'mod', original: 'foo:mod'}, value: {text: '1'}}
            ]);
        });

        it('should parse value with comparator', function () {
            var input = {
                'foo': '>10'
            };

            var result = query.parse(input);

            should.exist(result);
            result.should.be.an('Array');
            result.should.deep.equal([
                {key: {name: 'foo', original: 'foo'}, value: {comparator: {text: '>', db: '$gt'}, text: '10'}}
            ]);
        });
    });

    describe('reduceToOperations', function () {
        it('should return operations for empty query string', function () {
            var req = { query: {} };

            var result = query.reduceToOperations(req.query);

            should.exist(result);
            result.filter.should.deep.equal([]);
            result.sort.should.deep.equal([]);
            result.paging.should.deep.equal({count: 10, page: 1});
        });

        describe('_id', function () {
            it('filters by _id', function () {
                var searchParam = [];
                var req = {query: { '_id': '123456789012345678901234'}};

                var result = query.reduceToOperations(req.query, searchParam);

                should.exist(result);
            });
        });

        describe('_tag', function () {
            it('filters by tag', function () {
                var searchParam = [];
                var req = {query: { '_tag': 'http://acme.org/fhir/tags/needs-review'}};

                var result = query.reduceToOperations(req.query, searchParam);

                should.exist(result);
                result.filter.should.deep.equal([
                    {'tags.term': 'http://acme.org/fhir/tags/needs-review', 'tags.scheme': 'http://hl7.org/fhir/tag'}
                ]);
            });
        });

        describe('_profile', function () {
            it('filters by profile tag', function () {
                var searchParam = [];
                var req = {query: { '_profile': 'http://acme.org/lipid'}};

                var result = query.reduceToOperations(req.query, searchParam);

                should.exist(result);
                result.filter.should.deep.equal([
                    {'tags.term': 'http://acme.org/lipid', 'tags.scheme': 'http://hl7.org/fhir/tag/profile'}
                ]);
            });
        });

        describe('_security', function () {
            it('filters by security tag', function () {
                var searchParam = [];
                var req = {query: { '_security': 'http://acme.org/celeb'}};

                var result = query.reduceToOperations(req.query, searchParam);

                should.exist(result);
                result.filter.should.deep.equal([
                    {'tags.term': 'http://acme.org/celeb', 'tags.scheme': 'http://hl7.org/fhir/tag/security'}
                ]);
            });
        });

        describe('_sort', function () {
            it('sorts by field asc', function () {
                var searchParam = [
                    {
                        name: 'bar',
                        type: 'string',
                        document: {
                            path: 'Foo.bar'
                        }
                    }
                ];
                var req = {
                    query: {
                        '_sort': 'bar'
                    }
                };

                var result = query.reduceToOperations(req.query, searchParam);

                should.exist(result);
                result.sort.should.deep.equal([
                    {'resource.bar': 1}
                ]);
            });

            it('sorts by field asc when modifier asc', function () {
                var searchParam = [
                    {
                        name: 'bar',
                        type: 'string',
                        document: {
                            path: 'Foo.bar'
                        }
                    }
                ];
                var req = {
                    query: {
                        '_sort:asc': 'bar'
                    }
                };

                var result = query.reduceToOperations(req.query, searchParam);

                should.exist(result);
                result.sort.should.deep.equal([
                    {'resource.bar': 1}
                ]);
            });

            it('sorts by field desc when modifier desc', function () {
                var searchParam = [
                    {
                        name: 'bar',
                        type: 'string',
                        document: {
                            path: 'Foo.bar'
                        }
                    }
                ];
                var req = {
                    query: {
                        '_sort:desc': 'bar'
                    }
                };

                var result = query.reduceToOperations(req.query, searchParam);

                should.exist(result);
                result.sort.should.deep.equal([
                    {'resource.bar': -1}
                ]);
            });

            it('sorts by fields when multiple sort terms', function () {
                var searchParam = [
                    {
                        name: 'foo',
                        type: 'string',
                        document: {
                            path: 'Foo.foo'
                        }
                    },
                    {
                        name: 'bar',
                        type: 'string',
                        document: {
                            path: 'Foo.bar'
                        }
                    }
                ];
                var req = {
                    query: {
                        '_sort': ['foo', 'bar']
                    }
                };

                var result = query.reduceToOperations(req.query, searchParam);

                should.exist(result);
                result.sort.should.deep.equal([
                    {'resource.foo': 1},
                    {'resource.bar': 1}
                ]);
            });
        });

        describe('_count', function () {
            it('should return op with paging.count', function () {
                var req = {query: { '_count': '5'}};

                var result = query.reduceToOperations(req.query);

                should.exist(result);
                result.paging.should.deep.equal({count: 5, page: 1});
            });
        });

        describe('_page', function () {
            it('should return op with paging.page', function () {
                var req = {query: { '_page': '3'}};

                var result = query.reduceToOperations(req.query);

                should.exist(result);
                result.paging.should.deep.equal({count: 10, page: 3});
            });
        });

        describe('string search', function () {
            describe('string search vs string type', function () {
                it('should perform general search', function () {
                    var searchParam = [
                        {
                            name: 'bar',
                            type: 'string',
                            document: {
                                path: 'Foo.bar',
                                contentType: 'string'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'bar': 'mybar'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {'resource.bar': {$regex: '^mybar'}}
                    ]);
                });

                it('should perform exact search', function () {
                    var searchParam = [
                        {
                            name: 'bar',
                            type: 'string',
                            document: {
                                path: 'Foo.bar',
                                contentType: 'string'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'bar:exact': 'mybar'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {'resource.bar': 'mybar'}
                    ]);
                });
            });

            describe('string search vs Address type', function () {
                it('should perform general search', function () {
                    var searchParam = [
                        {
                            name: 'home',
                            type: 'string',
                            document: {
                                path: 'Foo.home',
                                contentType: 'Address'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'home': 'somewhere'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {
                            $or: [
                                {'resource.home.line': {$regex: '^somewhere'}},
                                {'resource.home.city': {$regex: '^somewhere'}},
                                {'resource.home.state': {$regex: '^somewhere'}},
                                {'resource.home.zip': {$regex: '^somewhere'}},
                                {'resource.home.country': {$regex: '^somewhere'}}
                            ]
                        }
                    ]);
                });

                it('should perform exact search', function () {
                    var searchParam = [
                        {
                            name: 'home',
                            type: 'string',
                            document: {
                                path: 'Foo.home',
                                contentType: 'Address'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'home:exact': 'somewhere'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {
                            $or: [
                                {'resource.home.line': 'somewhere'},
                                {'resource.home.city': 'somewhere'},
                                {'resource.home.state': 'somewhere'},
                                {'resource.home.zip': 'somewhere'},
                                {'resource.home.country': 'somewhere'}
                            ]
                        }
                    ]);
                });
            });

            describe('string search vs HumanName type', function () {
                it('filters by family, given', function () {
                    var searchParam = [
                        {
                            name: 'who',
                            type: 'string',
                            document: {
                                path: 'Foo.who',
                                contentType: 'HumanName'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'who': 'myName'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {
                            $or: [
                                {'resource.who.family': {$regex: '^myName'}},
                                {'resource.who.given': {$regex: '^myName'}}
                            ]
                        }
                    ]);
                });

                it('filters by exact family and given when modifier exact', function () {
                    var searchParam = [
                        {
                            name: 'who',
                            type: 'string',
                            document: {
                                path: 'Foo.who',
                                contentType: 'HumanName'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'who:exact': 'myName'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {
                            $or: [
                                {'resource.who.family': 'myName'},
                                {'resource.who.given': 'myName'}
                            ]
                        }
                    ]);
                });
            });
        });

        describe('token search', function () {
            describe('vs Boolean type', function () {
                it('filters by code value when true', function () {
                    var searchParam = [
                        {
                            name: 'isBar',
                            type: 'token',
                            document: {
                                path: 'Foo.isBar',
                                contentType: 'boolean'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'isBar': 'true'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {'resource.isBar': true}
                    ]);
                });

                it('filters by code value when false', function () {
                    var searchParam = [
                        {
                            name: 'isBar',
                            type: 'token',
                            document: {
                                path: 'Foo.isBar',
                                contentType: 'boolean'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'isBar': 'false'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {'resource.isBar': false}
                    ]);
                });
            });

            describe('vs CodeableConcept type', function () {
                it('filters by code value', function () {
                    var searchParam = [
                        {
                            name: 'bar',
                            type: 'token',
                            document: {
                                path: 'Foo.bar',
                                contentType: 'CodeableConcept'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'bar': 'myCode'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {'resource.bar.coding.code': 'myCode'}
                    ]);
                });

                it('filters by code value and system', function () {
                    var searchParam = [
                        {
                            name: 'bar',
                            type: 'token',
                            document: {
                                path: 'Foo.bar',
                                contentType: 'CodeableConcept'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'bar': 'mySystem|myCode'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {'resource.bar.coding.code': 'myCode', 'resource.bar.coding.system': 'mySystem'}
                    ]);
                });

                it('filters by code value and null system', function () {
                    var searchParam = [
                        {
                            name: 'bar',
                            type: 'token',
                            document: {
                                path: 'Foo.bar',
                                contentType: 'CodeableConcept'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'bar': '|myCode'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {'resource.bar.coding.code': 'myCode', 'resource.bar.coding.system': null}
                    ]);
                });

                it('filters by text when modifier text', function () {
                    var searchParam = [
                        {
                            name: 'bar',
                            type: 'token',
                            document: {
                                path: 'Foo.bar',
                                contentType: 'CodeableConcept'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'bar:text': 'myCode'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {'resource.bar.text': {$regex: '^myCode'} }
                    ]);
                });

            });

            describe('vs Identifier type', function () {
                it('filters by code value', function () {
                    var searchParam = [
                        {
                            name: 'id',
                            type: 'token',
                            document: {
                                path: 'Foo.bar.id',
                                contentType: 'Identifier'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'id': '12345'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {'resource.bar.id.value': '12345'}
                    ]);
                });

                it('filters by code value and system', function () {
                    var searchParam = [
                        {
                            name: 'id',
                            type: 'token',
                            document: {
                                path: 'Foo.bar.id',
                                contentType: 'Identifier'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'id': 'mySystem|12345'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {'resource.bar.id.value': '12345',
                            'resource.bar.id.system': 'mySystem'}
                    ]);
                });

                it('filters by code value and null system', function () {
                    var searchParam = [
                        {
                            name: 'id',
                            type: 'token',
                            document: {
                                path: 'Foo.bar.id',
                                contentType: 'Identifier'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'id': '|12345'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {'resource.bar.id.value': '12345',
                            'resource.bar.id.system': null}
                    ]);
                });

                it('filters by text when modifier text', function () {
                    var searchParam = [
                        {
                            name: 'id',
                            type: 'token',
                            document: {
                                path: 'Foo.bar.id',
                                contentType: 'Identifier'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'id:text': '12345'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {'resource.bar.id.label': {$regex: '^12345'}}
                    ]);
                });

            });
        });

        describe('date search', function () {
            describe('vs date type', function () {
                it('filters by date', function () {
                    var searchParam = [
                        {
                            name: 'birthDate',
                            type: 'date',
                            document: {
                                path: 'Foo.birthDate',
                                contentType: 'date'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'birthDate': '1953-01-15'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {'resource.birthDate': {$regex: '^1953-01-15'}}
                    ]);
                });

                it('filters by inequality', function () {
                    var searchParam = [
                        {
                            name: 'birthDate',
                            type: 'date',
                            document: {
                                path: 'Foo.birthDate',
                                contentType: 'date'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'birthDate': '>1953-01-15'
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {'resource.birthDate': {$gt: '1953-01-15'}}
                    ]);
                });

                it('filters by multiple inequalities', function () {
                    var searchParam = [
                        {
                            name: 'birthDate',
                            type: 'date',
                            document: {
                                path: 'Foo.birthDate',
                                contentType: 'date'
                            }
                        }
                    ];
                    var req = {
                        query: {
                            'birthDate': ['>1953-01-15', '<1955-01-15']
                        }
                    };

                    var result = query.reduceToOperations(req.query, searchParam);

                    should.exist(result);
                    result.filter.should.deep.equal([
                        {'resource.birthDate': {$gt: '1953-01-15'}},
                        {'resource.birthDate': {$lt: '1955-01-15'}}
                    ]);
                });
            });
        });
    });
});
