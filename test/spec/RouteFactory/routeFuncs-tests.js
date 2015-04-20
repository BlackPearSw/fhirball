var routeFuncs = require('./../../../lib/RouteFactory/routeFuncs');

var should = require('chai').should();

describe('routeFuncs', function(){
    describe('makePojo', function(){
        it('should make javascript object from request', function(){
            var req = {
                headers: {},
                params: {
                    id: '123456789'
                },
                body: {
                    resourceType: 'Foo',
                    bar: 'fubar'
                },
                user: 'user@system'
            };

            var result = routeFuncs.makePojo(req);

            should.exist(result);

            should.exist(result.meta);
            result.meta.id.should.equal(req.params.id);
            result.meta.versionId.should.equal('0');
            result.meta.lastUpdated.should.be.a('Date');
            result.meta.user.should.equal('user@system');

            should.exist(result.tags);
            result.tags.length.should.equal(0);

            should.exist(result.resource);
            result.resource.should.deep.equal(req.body);

        });

        it('should throw exception when req undefined', function(){
            should.Throw(function(){
                routeFuncs.makePojo();
            });
        });

        it('should throw exception when req.body undefined', function(){
            var req = { };

            should.Throw(function(){
                routeFuncs.makePojo(req);
            });
        });
    });

    describe('makeMetadata', function(){
        it('should throw exception when req undefined', function(){
            should.Throw(function(){
                routeFuncs.makeMetadata();
            });
        });

        it('should make metadata object from request', function(){
            var req = {
                headers: {

                },
                params: {
                    id: '123456789'
                },
                body: {
                    resourceType: 'Foo',
                    bar: 'fubar'
                }
            };

            var result = routeFuncs.makeMetadata(req);

            should.exist(result);
            result.id.should.equal(req.params.id);
            result.versionId.should.equal('0');
            result.lastUpdated.should.be.a('Date');

        });

        it('should allocate id when not populated', function(){
            var req = {
                headers: {

                },
                params: {
                },
                body: {
                    resourceType: 'Foo',
                    bar: 'fubar'
                }
            };

            var result = routeFuncs.makeMetadata(req);

            should.exist(result);
            result.id.length.should.equal(24);
            result.versionId.should.equal('0');
            result.lastUpdated.should.be.a('Date');

        });

        it('should set versionId from Content-Location header', function(){
            var req = {
                headers: {
                    'content-location': './Foo/123456789/_history/99'
                },
                params: {
                    id: '123456789'
                },
                body: {
                    resourceType: 'Foo',
                    bar: 'fubar'
                }
            };

            var result = routeFuncs.makeMetadata(req);

            should.exist(result);
            result.versionId.should.equal('99');
        });

        it('should set versionId to 0 where there is no Content-Location header', function(){
            var req = {
                headers: {

                },
                params: {
                    id: '123456789'
                },
                body: {
                    resourceType: 'Foo',
                    bar: 'fubar'
                }
            };

            var result = routeFuncs.makeMetadata(req);

            should.exist(result);
            result.versionId.should.equal('0');
        });
    });

    describe('makeContentLocationForCreate', function(){
        it('should throw exception when req undefined', function(){
            should.Throw(function(){
                routeFuncs.makeContentLocationForNewResource();
            });
        });

        it('should throw exception when doc undefined', function(){
            should.Throw(function(){
                routeFuncs.makeContentLocationForNewResource({});
            });
        });

        it('should make ContentLocation header', function(){
            var req = {
                headers: {
                    host: '127.0.0.1:1337'
                },
                protocol: 'http',
                originalUrl: '/fhirball/Foo'

            };

            var doc = {
                _id: '123456789',
                _version: '99'
            };

            var result = routeFuncs.makeContentLocationForNewResource(req, doc);

            should.exist(result);
            result.should.equal('http://127.0.0.1:1337/fhirball/Foo/123456789/_history/99');
        });
    });

    describe('makeContentLocationForExistingResource', function(){
        it('should throw exception when req undefined', function(){
            should.Throw(function(){
                routeFuncs.makeContentLocationForExistingResource();
            });
        });

        it('should throw exception when doc undefined', function(){
            should.Throw(function(){
                routeFuncs.makeContentLocationForExistingResource({});
            });
        });

        it('should make ContentLocation header', function(){
            var req = {
                headers: {
                    host: '127.0.0.1:1337'
                },
                protocol: 'http',
                originalUrl: '/fhirball/Foo/123456789'

            };

            var doc = {
                _id: '123456789',
                _version: '99'
            };

            var result = routeFuncs.makeContentLocationForExistingResource(req, doc);

            should.exist(result);
            result.should.equal('http://127.0.0.1:1337/fhirball/Foo/123456789/_history/99');
        });

        it('should make ContentLocation header when url includes versionId', function(){
            var req = {
                headers: {
                    host: '127.0.0.1:1337'
                },
                protocol: 'http',
                originalUrl: '/fhirball/Foo/123456789/_history/99'

            };

            var doc = {
                _id: '123456789',
                _version: '99'
            };

            var result = routeFuncs.makeContentLocationForExistingResource(req, doc);

            should.exist(result);
            result.should.equal('http://127.0.0.1:1337/fhirball/Foo/123456789/_history/99');
        });
    });

    describe('makeLocationForExistingResource', function(){
        it('should throw exception when req undefined', function(){
            should.Throw(function(){
                routeFuncs.makeLocationForExistingResource();
            });
        });

        it('should throw exception when doc undefined', function(){
            should.Throw(function(){
                routeFuncs.makeLocationForExistingResource({});
            });
        });

        it('should make Location header', function(){
            var req = {
                headers: {
                    host: '127.0.0.1:1337'
                },
                protocol: 'http',
                originalUrl: '/fhirball/Foo/123456789'

            };

            var doc = {
                _id: '123456789',
                _version: '99'
            };

            var result = routeFuncs.makeLocationForExistingResource(req, doc);

            should.exist(result);
            result.should.equal('http://127.0.0.1:1337/fhirball/Foo/123456789/_history/99');
        });
    });
});