var jsoq = require('../../../lib/jsoq');

var should = require('chai').should();

describe('jsoq', function () {

    var obj;

    beforeEach(function () {
        obj = {
            a: [0, 1, 2, 3],
            b: {
                c: [
                    {},
                    {d: [
                        {e: '1234567'},
                        {}
                    ]}
                ]
            },
            f: {
                g: '123456',
                h: '54321',
                i: '1234'
            },
            h: '12345',
            i: {
                j: [
                    {
                        k: 1, l: 2
                    },
                    {
                        k: 3, l: 4
                    }
                ]
            }
        }
    });

    it('should throw exception if obj undefined', function () {
        should.Throw(function () {
            jsoq();
        });
    });

    it('should return a query object', function () {
        var result = jsoq(obj);

        should.exist(result);
    });

    describe('get', function () {
        it('should return undefined when path not found', function () {
            var result = jsoq(obj).get('x.y.z');

            should.not.exist(result);
        });

        it('should return value from simple path', function () {
            var result = jsoq(obj).get('h');

            should.exist(result);
            result.should.equal(obj.h);
        });

        it('should return value from nested path', function () {
            var result = jsoq(obj).get('f.g');

            should.exist(result);
            result.should.equal(obj.f.g);
        });

        it('should return value from nested path with array, using mongo syntax', function () {
            var result = jsoq(obj).get('a.0');

            should.exist(result);
            result.should.equal(obj.a[0]);
        });

        it('should return value from nested path with array, using mongo syntax', function () {
            var result = jsoq(obj).get('b.c.1.d.0.e');

            should.exist(result);
            result.should.equal(obj.b.c[1].d[0].e);
        });

        it('should return value from nested path with array, using javascript syntax', function () {
            var result = jsoq(obj).get('a[0]');

            should.exist(result);
            result.should.equal(obj.a[0]);
        });

        it('should return value from nested path with array, using javascript syntax', function () {
            var result = jsoq(obj).get('b.c[1].d[0].e');

            should.exist(result);
            result.should.equal(obj.b.c[1].d[0].e);
        });
    });

    describe('put', function () {
        it('should throw exception if path undefined', function () {
            should.Throw(function () {
                jsoq(obj).put();
            });
        });

        it('should throw exception if value undefined', function () {
            should.Throw(function () {
                jsoq(obj).put('p.q');
            });
        });

        it('should put value to simple path', function () {
            jsoq(obj).put('p', 'q');

            obj.p.should.equal('q');
        });

        it('should put value to complex path', function () {
            jsoq(obj).put('p.q.r.s', 't');

            obj.p.q.r.s.should.equal('t');
        });
    });

    describe('has', function () {
        it('should return true when matches a simple path', function () {
            var match = {
                g: '123456',
                h: '54321'
            };

            var result = jsoq(obj).has({'f': match});

            should.exist(result);
            result.should.equal(true);
        });

        it('should return false when doesn\'t match a simple path', function () {
            var match = {
                g: '999999',
                h: '54321'
            };

            var result = jsoq(obj).has({'identifier': match});

            should.exist(result);
            result.should.equal(false);
        });
    })
});