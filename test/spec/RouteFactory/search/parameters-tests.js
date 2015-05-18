var parameters = require('./../../../../lib/RouteFactory/search/parameters');

var should = require('chai').should();

//TODO: Need matrix of allowed search params vs options

describe('parameters', function () {
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

            var result = parameters.getSearchParam(searchParam, parameter);

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

            var result = parameters.getSearchParam(searchParam, parameter);

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

            var result = parameters.getSearchParam(searchParam, parameter);

            should.not.exist(result);
        })
    });

    describe('getPathInResource', function () {
        it('should make resource path from path', function () {
            var path = 'Foo.bar.name';

            var result = parameters.getPathInResource(path);

            should.exist(result);
            result.should.equal('resource.bar.name');
        });

        it('should make db path for path _id', function () {
            var path = '_id';

            var result = parameters.getPathInResource(path);

            should.exist(result);
            result.should.equal('_id');
        });
    });

    describe('getPathInSearch', function () {
        it('should create search path from original path', function () {
            var path = 'Foo.bar.name';

            var result = parameters.getPathInSearch(path);

            should.exist(result);
            result.should.equal('search.bar.name');
        });

        it('should make not change path for root property', function () {
            var path = '_id';

            var result = parameters.getPathInSearch(path);

            should.exist(result);
            result.should.equal(path);
        });
    });
});