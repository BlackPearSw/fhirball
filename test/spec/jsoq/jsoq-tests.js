var jsoq = require('../../../lib/fhir/jsoq');

var should = require('chai').should();

describe('jsoq', function () {

    var foo;

    beforeEach(function () {
        foo = {
            resourceType: 'Foo',
            o1: {
                o2: 'asdlfj'
            },
            a: [0, 1, 2, 3],
            b: {
                c: [
                    {},
                    {d: [
                        {e: 'asdfasdf'},
                        {}
                    ]}
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
        var result = jsoq(foo);

        should.exist(result);
    });

    describe('get', function () {
        it('should return undefined when path not found', function () {
            var result = jsoq(foo).get('x.y.z');

            should.not.exist(result);
        });

        it('should return value from simple path', function () {
            var result = jsoq(foo).get('resourceType');

            should.exist(result);
            result.should.equal(foo.resourceType);
        });

        it('should return value from nested path', function () {
            var result = jsoq(foo).get('o1.o2');

            should.exist(result);
            result.should.equal(foo.o1.o2);
        });

        it('should return value from nested path with array, using mongo syntax', function () {
            var result = jsoq(foo).get('a.0');

            should.exist(result);
            result.should.equal(foo.a[0]);
        });

        it('should return value from nested path with array, using mongo syntax', function () {
            var result = jsoq(foo).get('b.c.1.d.0.e');

            should.exist(result);
            result.should.equal(foo.b.c[1].d[0].e);
        });

        it('should return value from nested path with array, using javascript syntax', function () {
            var result = jsoq(foo).get('a[0]');

            should.exist(result);
            result.should.equal(foo.a[0]);
        });

        it('should return value from nested path with array, using javascript syntax', function () {
            var result = jsoq(foo).get('b.c[1].d[0].e');

            should.exist(result);
            result.should.equal(foo.b.c[1].d[0].e);
        });
    });

    describe('put', function () {
        it('should throw exception if path undefined', function () {
            should.Throw(function () {
                jsoq(foo).put();
            });
        });

        it('should throw exception if value undefined', function () {
            should.Throw(function () {
                jsoq(foo).put('p.q');
            });
        });

        it('should put value to simple path', function () {
            jsoq(foo).put('p', 'q');

            foo.p.should.equal('q');
        });

        it('should put value to complex path', function () {
            jsoq(foo).put('p.q.r.s', 't');

            foo.p.q.r.s.should.equal('t');
        });
    });

    describe('has', function () {
        var foo = {
            resourceType: 'Foo',
            identifier: [
                {
                    value: '12345',
                    system: 'http://fhirball.com/test',
                    label: 'id'
                }
            ]
        };

        it('should return true when matches a simple path', function(){
            var identifier = {
                value: '12345',
                system: 'http://fhirball.com/test'
            };

            var result = jsoq(foo).has({'identifier': identifier});

            should.exist(result);
            result.should.equal(true);
        });

        it('should return false when doesn\'t match a simple path', function(){
            var identifier = {
                value: '54321',
                system: 'http://fhirball.com/test'
            };

            var result = jsoq(foo).has({'identifier': identifier});

            should.exist(result);
            result.should.equal(false);
        });
    })
});