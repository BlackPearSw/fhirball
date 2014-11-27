var param = require('./../../../../lib/RouteFactory/search/parameter');

var should = require('chai').should();

//TODO: Need matrix of allowed search params vs options

describe('parameter', function () {
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

            var result = param.getSearchParam(searchParam, parameter);

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

            var result = param.getSearchParam(searchParam, parameter);

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

            var result = param.getSearchParam(searchParam, parameter);

            should.not.exist(result);
        })
    });
});