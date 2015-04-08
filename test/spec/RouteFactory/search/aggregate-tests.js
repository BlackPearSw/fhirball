var aggregate = require('../../../../lib/RouteFactory/search/aggregate');

var should = require('chai').should();

describe('aggregate', function () {
    describe('reduceToPipeline', function () {
        it('should always include paging at end of pipeline', function () {
            var ops = {
                match: [],
                sort: [],
                paging: {count: 10, page: 3}
            };

            var result = aggregate.reduceToPipeline(ops);

            should.exist(result);
            result.should.deep.equal([{$skip: 20}, {$limit: 10}]);
        });

        it('should include sorting before paging pipeline', function () {
            var ops = {
                match: [],
                sort: [{foo: 1}, {bar: -1}],
                paging: {count: 10, page: 1}
            };

            var result = aggregate.reduceToPipeline(ops);

            should.exist(result);
            //TODO: Can we flatten $sort for match/sort as an optimisation?
            result.should.deep.equal([{$sort: {foo: 1}}, {$sort: {bar: -1}}, {$skip: 0}, {$limit: 10}]);
        });

        it('should include filtering at start of pipeline', function () {
            var ops = {
                match: [{foo: {$regex: '^bar'}}],
                sort: [{foo: 1}],
                paging: {count: 10, page: 1}
            };

            var result = aggregate.reduceToPipeline(ops);

            should.exist(result);
            result.should.deep.equal([{$match: {foo: {$regex: '^bar'}}}, {$sort: {foo: 1}}, {$skip: 0}, {$limit: 10}]);
        });
    });
});