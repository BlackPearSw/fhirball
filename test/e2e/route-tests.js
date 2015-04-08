var express = require('express');
var fhirball = require('../../lib/index');
var testcase = require('./data/conformance.route-tests.js');

var fs = require('fs');
var request = require('supertest');
var compare = require('../spec/utils/compare');
var expect = require('expect.js');
var async = require('async');

var CONTENT_TYPE = 'application/json; charset=utf-8';

describe('route', function () {

    var app;
    var middlewareCalled = false;

    before(function () {
        //create app using fhirball router to provide fhir rest api
        app = express();
        var options = {
            db: 'mongodb://localhost/fhirball-test',
            conformance: testcase.conformance,
            'content-type': 'application/json',
            middleware: [
                function (req, res, next){
                    next();
                },
                function (req, res, next){
                    middlewareCalled = true;
                    next();
                }
            ]
        };
        app.use(testcase.route, new fhirball.Router(options));

        //start the app
        app.listen(1337);
    });

    describe('/', function () {
        it('GET should return Conformance resource', function (done) {
            var path = testcase.route;
            request(app)
                .get(path)
                .expect(200)
                .expect('content-type', CONTENT_TYPE)
                .end(function (err, res) {
                    if (err) return done(err);

                    res.body = JSON.parse(res.text);
                    expect(res.body.resourceType).to.be('Conformance');
                    expect(res.body.acceptUnknown).to.be(true);
                    expect(res.body.format[0]).to.be('json');

                    expect(res.body.rest[0].resource[0].readHistory).to.be(true);
                    expect(res.body.rest[0].resource[0].updateCreate).to.be(false);
                    expect(res.body.rest[0].resource[0].searchInclude[0]).to.be(undefined);

                    expect(res.body.rest[0].resource[0].searchParam[0]).to.be(undefined);

                    done();
                });
        });


        it('should call middleware called', function (done) {
            var path = testcase.route;
            request(app)
                .get(path)
                .expect(200)
                .expect('content-type', CONTENT_TYPE)
                .end(function (err, res) {
                    if (err) return done(err);

                    expect(middlewareCalled).to.be(true);

                    done();
                });
        });
    });

    describe.skip('/<resource>', function () {
        it('GET should return OperationOutcome when error occurs', function (done) {
            var path = testcase.route + 'Patient/invalidid';
            request(app)
                .get(path)
                .expect(500)
                .expect('content-type', CONTENT_TYPE)
                .end(function (err, res) {
                    if (err) return done(err);

                    expect(res.body.resourceType).to.equal('OperationOutcome');

                    done();
                });
        });
    });

    describe('/metadata', function () {
        it('GET should return Conformance resource', function (done) {
            var path = testcase.route;
            request(app)
                .get(path)
                .expect(200)
                .expect('content-type', CONTENT_TYPE)
                .end(function (err, res) {
                    if (err) return done(err);

                    res.body = JSON.parse(res.text);
                    expect(res.body.resourceType).to.be('Conformance');

                    done();
                });
        });
    });

    testcase.conformance.rest[0].resource.forEach(function (resource) {
        describe('/' + resource.type, function () {
            it('GET / should return Bundle', function (done) {
                var path = testcase.route + resource.type;
                request(app)
                    .get(path)
                    .expect(200)
                    .expect('Content-Type', CONTENT_TYPE)
                    .end(function (err, res) {
                        if (err) return done(err);

                        if (res.body.entry.length > 0) {
                            var expectedType = resource.type === 'Document' || resource.type === 'Query' ? 'Bundle' : resource.type;
                            expect(res.body.entry[0].content.resourceType).to.equal(expectedType);
                            expect(res.body.entry[0].category).to.be.ok();
                        }

                        done();
                    });
            });

            it('GET /_search should return Bundle', function (done) {
                var path = testcase.route + resource.type + '/_search';
                request(app)
                    .get(path)
                    .expect(200)
                    .expect('Content-Type', CONTENT_TYPE)
                    .end(function (err, res) {
                        if (err) return done(err);

                        if (res.body.entry.length > 0) {
                            var expectedType = resource.type === 'Document' || resource.type === 'Query' ? 'Bundle' : resource.type;
                            expect(res.body.entry[0].content.resourceType).to.equal(expectedType);
                            expect(res.body.entry[0].category).to.be.ok();
                        }

                        done();
                    });
            });

            describe('POST, GET, PUT, DELETE /' + resource.type + ' should enable resource creation, retrieval, version-specific retrieval, update, deletion', function () {
                var path = testcase.resources_path + '/wellformed/' + resource.type;
                if (fs.existsSync(path)) {
                    fs.readdirSync(path)
                        .forEach(function (file) {
                            //ignore test cases containing .skip in filename
                            if (file.indexOf('.skip') > 0) {
                                return;
                            }

                            var input = JSON.parse(fs.readFileSync(path + '/' + file, 'utf-8'));
                            it(file, function (done) {
                                function postResourceToApi(callback) {
                                    var uri = testcase.route + resource.type;
                                    request(app)
                                        .post(uri)
                                        .set('Category', 'testTag; scheme="http://test.tags"; label="test tag"')
                                        //TODO: Set cont-type to include charset UTF8
                                        .send(input)
                                        .expect(201)
                                        .expect('Location', /.*/)
                                        .end(function (err, res) {
                                            if (err) return callback(err);

                                            callback(null, res.header['location']);
                                        });
                                }

                                function getTagsFromApi(location, callback) {
                                    var url = location.split('/_history/')[0];
                                    var path = url.substring(22) + '/_tags';
                                    request(app)
                                        .get(path)
                                        .expect(200)
                                        .expect('Content-Type', CONTENT_TYPE)
                                        .end(function (err, res) {
                                            if (err) return callback(err);

                                            var tagList = res.body;
                                            expect(tagList.resourceType).to.equal('TagList');
                                            expect(tagList.category[0].term).to.equal('testTag');
                                            expect(tagList.category[0].scheme).to.equal('http://test.tags');
                                            expect(tagList.category[0].label).to.equal('test tag');

                                            if (tagList.category[1]){
                                                expect(tagList.category[1].term).to.equal('unit-testing');
                                                expect(tagList.category[2].term).to.equal('updateTag');
                                            }

                                            callback(null, location);
                                        });
                                }

                                function putTagsToApi(location, callback) {
                                    var url = location.split('/_history/')[0];
                                    var path = url.substring(22) + '/_tags';
                                    var tagList = {
                                        resourceType: 'TagList',
                                        category: [
                                            {
                                                "term": "unit-testing",
                                                "label": "Unit testing tags",
                                                "scheme": "http://hl7.org/fhir/tag"
                                            },
                                            {
                                                "term": "remove-me",
                                                "label": "Tag to be removed during unit testing",
                                                "scheme": "http://hl7.org/fhir/tag"
                                            }
                                        ]};
                                    request(app)
                                        .post(path)
                                        .send(tagList)
                                        .expect(200)
                                        .end(function (err) {
                                            if (err) return callback(err);

                                            callback(null, location);
                                        });
                                }

                                function deleteTagsFromApi(location, callback) {
                                    var url = location.split('/_history/')[0];
                                    var path = url.substring(22) + '/_tags/_delete';
                                    var tagList = {
                                        resourceType: 'TagList',
                                        category: [
                                            {
                                                "term": "remove-me",
                                                "label": "Tag to be removed during unit testing",
                                                "scheme": "http://hl7.org/fhir/tag"
                                            }
                                        ]};
                                    request(app)
                                        .post(path)
                                        .send(tagList)
                                        .expect(200)
                                        .end(function (err) {
                                            if (err) return callback(err);

                                            callback(null, location);
                                        });
                                }

                                function getResourceFromApi(location, callback) {
                                    var url = location.split('/_history/')[0];
                                    var path = url.substring(22);
                                    request(app)
                                        .get(path)
                                        .expect(200)
                                        .expect('Content-Type', CONTENT_TYPE)
                                        .expect('Content-Location', /.*/)
                                        .expect('Category', 'unit-testing; scheme="http://hl7.org/fhir/tag"; label="Unit testing tags"')
                                        .end(function (err, res) {
                                            if (err) return callback(err);

                                            callback(null, res.body, res.header['content-location']);
                                        });
                                }

                                function checkRetrievedResource(resource, location, callback) {
                                    var testMatch = true;
                                    if (testMatch) {
                                        if (compare.isSubset(input, resource)) {
                                            callback(null, resource, location);
                                        }
                                        else {
                                            callback(new Error('Retrieved document does not match input'));
                                        }
                                    }
                                    else {
                                        callback(null, resource, location);
                                    }
                                }

                                function getResourceFromApiByVersion(resource, location, callback) {
                                    var url = location;
                                    var path = url.substring(22);
                                    request(app)
                                        .get(path)
                                        .expect(200)
                                        .expect('Content-Type', CONTENT_TYPE)
                                        .expect('Content-Location', /.*/)
                                        .expect('Category', 'unit-testing; scheme="http://hl7.org/fhir/tag"; label="Unit testing tags"')
                                        .end(function (err, res) {
                                            if (err) return callback(err);

                                            callback(null, res.body, res.header['content-location']);
                                        });
                                }

                                function putResourceToApi(resource, location, callback) {
                                    var url = location.split('/_history/')[0];
                                    var path = url.substring(22);
                                    request(app)
                                        .put(path)
                                        .set('content-location', location)
                                        .set('Category', 'updateTag; scheme="http://test.tags"; label="update tag"')
                                        .send(resource)
                                        .expect(200)
                                        //.expect('content-location', /.*/)
                                        .end(function (err, res) {
                                            if (err) return callback(err);

                                            callback(null, res.header['content-location']);
                                        });
                                }

                                function deleteResourceFromApi(location, callback) {
                                    var url = location.split('/_history/')[0];
                                    var path = url.substring(22);
                                    request(app)
                                        .del(path)
                                        .expect(204)
                                        .end(function (err) {
                                            if (err) return callback(err);

                                            callback(null, location);
                                        });
                                }

                                function getResourceHistoryFromApi(location, callback) {
                                    var url = location.split('/_history/')[0];
                                    var path = url.substring(22) + '/_history';
                                    request(app)
                                        .get(path)
                                        .expect(200)
                                        .expect('Content-Type', CONTENT_TYPE)
                                        .end(function (err, res) {
                                            if (err) return callback(err);

                                            callback(null);
                                        });
                                }

                                function getTypeHistoryFromApi(callback) {
                                    var path = '/fhir/' + resource.type + '/_history';
                                    request(app)
                                        .get(path)
                                        .expect(200)
                                        .expect('Content-Type', CONTENT_TYPE)
                                        .end(function (err, res) {
                                            if (err) return callback(err);

                                            callback(null);
                                        });
                                }

                                async.waterfall([
                                    postResourceToApi,
                                    getTagsFromApi,
                                    putTagsToApi,
                                    deleteTagsFromApi,
                                    getResourceFromApi,
                                    checkRetrievedResource,
                                    getResourceFromApiByVersion,
                                    putResourceToApi,
                                    getTagsFromApi,
                                    deleteResourceFromApi,
                                    getResourceHistoryFromApi,
                                    getTypeHistoryFromApi
                                ], function (err) {
                                    if (err) {
                                        console.log(err);
                                        return (done(err));
                                    }
                                    done();
                                });
                            });

                        });
                }
            });
        });
    });
});