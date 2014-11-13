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
                }
            };

            var result = routeFuncs.makePojo(req);

            should.exist(result);

            should.exist(result.metadata);
            result.metadata.id.should.equal(req.params.id);
            result.metadata.version.should.equal('0');
            result.metadata.lastModifiedDate.should.be.a('Date');

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
            result.version.should.equal('0');
            result.lastModifiedDate.should.be.a('Date');

        });

        it('should set version from Content-Location header', function(){
            var req = {
                headers: {
                    'Content-Location': './Foo/123456789/_history/99'
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
            result.version.should.equal('99');
        });

        it('should set version to 0 where there is no Content-Location header', function(){
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
            result.version.should.equal('0');
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