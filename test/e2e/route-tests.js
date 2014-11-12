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

    before(function () {
        //create app using fhirball router to provide fhir rest api
        app = express();
        var options = {
            db: 'mongodb://localhost/fhirball-test',
            conformance: testcase.conformance,
            'content-type': 'application/json'
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
                    .expect('content-type', CONTENT_TYPE)
                    .end(function (err, res) {
                        if (err) return done(err);

                        done();
                    });
            });

            describe('POST, GET, PUT, DELETE /' + resource.type + ' should enable resource creation, retrieval, update, deletion', function () {
                var path = testcase.resources_path + '/wellformed/' + resource.type;
                if (fs.existsSync(path)) {
                    fs.readdirSync(path)
                        //.filter(function(file){
                        //    return file === 'medication-example-f004-metoprolol.json';
                        //})
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
                                    .send(input)
                                    .expect(201)
                                    //.expect('location', /.*/)
                                    .end(function (err, res) {
                                        if (err) return callback(err);

                                        callback(null, res.header['location']);
                                    });
                            }

                            function getResourceFromApi(location, callback) {
                                var url = location.split('/_history/')[0];
                                var path = url.substring(22);
                                request(app)
                                    .get(path)
                                    .expect(200)
                                    .expect('content-type', CONTENT_TYPE)
                                    .expect('content-location', /.*/)
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

                            function putResourceToApi(resource, location, callback) {
                                var url = location.split('/_history/')[0];
                                var path = url.substring(22);
                                request(app)
                                    .put(path)
                                    .set('content-location', location)
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

                                        callback(null);
                                    });
                            }

                            async.waterfall([
                                postResourceToApi,
                                getResourceFromApi,
                                checkRetrievedResource,
                                putResourceToApi,
                                deleteResourceFromApi
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