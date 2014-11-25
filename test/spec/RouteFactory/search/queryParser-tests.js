var queryParser = require('./../../../../lib/RouteFactory/search/queryParser');

var should = require('chai').should();

//TODO: Need matrix of allowed search params vs options

describe('queryParser', function () {
    describe('parse', function () {
        it('should parse empty query string', function () {
            var query = {};

            var result = queryParser.parse(query);

            should.exist(result);
            result.filter.should.deep.equal({});
            result.sort.should.deep.equal({});
            result.paging.should.deep.equal({});
        });

        it('should parse _sort', function () {
            var searchParam = [
                {
                    name: 'bar',
                    type: 'string',
                    document: {
                        path: ['Foo.bar']
                    }
                }
            ];
            var query = {
                '_sort': 'bar'
            };

            var result = queryParser.parse(query, searchParam);

            should.exist(result);
            result.filter.should.deep.equal({});
            result.sort.should.deep.equal({'$sort':{'resource.bar': 1}});
            result.paging.should.deep.equal({});
        });
    });
});
