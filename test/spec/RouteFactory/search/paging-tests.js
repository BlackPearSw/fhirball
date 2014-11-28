var paging = require('../../../../lib/RouteFactory/search/paging');

var should = require('chai').should();

describe('paging', function() {
    describe('getPage', function () {
        it('should return page when defined', function () {
            var req = {
                query : {
                    page : '3'
                }
            };

            var result = paging.getPage(req);

            result.should.be.a('Number');
            result.should.equal(3);
        });

        it('should return 1 when page undefined', function () {
            var req = {
                query : {
                }
            };

            var result = paging.getPage(req);

            result.should.be.a('Number');
            result.should.equal(1);
        });
    });

    describe('getRestriction', function () {
        it('should throw when page is undefined', function () {
            should.Throw(function(){
                paging.getRestriction();
            });
        });

        it('should throw when page_size is undefined', function () {
            var page = 1;

            should.Throw(function(){
                paging.getRestriction(page);
            });
        });

        it('should throw when page is 0', function () {
            var page = 0;
            var page_size = 10;

            should.Throw(function(){
                paging.getRestriction(page, page_size);
            });
        });

        it('should throw when page is less than 0', function () {
            var page = -1;
            var page_size = 10;

            should.Throw(function(){
                paging.getRestriction(page, page_size);
            });
        });

        it('should throw when page_size is 0', function () {
            var page = 1;
            var page_size = 0;

            should.Throw(function(){
                paging.getRestriction(page, page_size);
            });
        });

        it('should throw when page_size is less than 0', function () {
            var page = 1;
            var page_size = -1;

            should.Throw(function(){
                paging.getRestriction(page, page_size);
            });
        });

        it('should return skip: 0, limit: 10 for page: 1, page_size: 10', function () {
            var page = 1;
            var page_size = 10;

            var result = paging.getRestriction(page, page_size);

            result.skip.should.equal(0);
            result.limit.should.equal(page_size);
        });

        it('should return skip: 20, limit: 10 for page: 3, page_size: 10', function () {
            var page = 3;
            var page_size = 10;

            var result = paging.getRestriction(page, page_size);

            result.skip.should.equal(20);
            result.limit.should.equal(page_size);
        });

        it('should return skip: 20, limit: 10 for page: 3, page_size: 10', function () {
            var page = 3;
            var page_size = 8;

            var result = paging.getRestriction(page, page_size);

            result.skip.should.equal(16);
            result.limit.should.equal(page_size);
        });
    });

    describe('getLink', function () {
        it('should return link array', function () {
            var req = {
                originalUrl: '/base/Resource?name=bob&page=3',
                protocol: 'http',
                headers: {
                    host: 'localhost:8080'
                }
            };
            var queryString = '?name=bob&_count=5&page=3';
            var more = true;

            var result = paging.getLink(req, queryString, { count:5, page: 3}, more);

            result.should.deep.equal([
                {rel: 'self', href: 'http://localhost:8080/base/Resource?name=bob&_count=5&page=3'},
                {rel: 'previous', href: 'http://localhost:8080/base/Resource?name=bob&_count=5&page=2'},
                {rel: 'next', href: 'http://localhost:8080/base/Resource?name=bob&_count=5&page=4'}
            ]);
        });

        it('should not include previous when page=1', function () {
            var req = {
                originalUrl: '/base/Resource?name=bob&page=1',
                protocol: 'http',
                headers: {
                    host: 'localhost:8080'
                }
            };
            var queryString = '?name=bob&_count=5&page=1';
            var more = true;

            var result = paging.getLink(req, queryString, { count:5, page: 1}, more);

            result.should.deep.equal([
                {rel: 'self', href: 'http://localhost:8080/base/Resource?name=bob&_count=5&page=1'},
                {rel: 'next', href: 'http://localhost:8080/base/Resource?name=bob&_count=5&page=2'}
            ]);
        });

        it('should not include next when more=false', function () {
            var req = {
                originalUrl: '/base/Resource?name=bob&page=4',
                protocol: 'http',
                headers: {
                    host: 'localhost:8080'
                }
            };
            var more = false;
            var queryString = '?name=bob&_count=5&page=4';
            var result = paging.getLink(req, queryString, { count:5, page: 4}, more);

            result.should.deep.equal([
                {rel: 'self', href: 'http://localhost:8080/base/Resource?name=bob&_count=5&page=4'},
                {rel: 'previous', href: 'http://localhost:8080/base/Resource?name=bob&_count=5&page=3'}
            ]);
        });
    });
});