var express = require('express');
var mongoose = require('mongoose');
var fhirball = require('../lib/index');
var testcase = require('./testcases/0.0.81.js');

var fs = require('fs');
var async = require('async');
var request = require('supertest');
var expect = require('expect.js');
var compare = require('../test/utils/compare');

function clearCollection(name) {
    return function (done) {
        var collection = mongoose.connection.collections[name];
        if (collection) {
            collection.drop(function (err) {
                console.log(err);
                done();
            });
        }
        else {
            done();
        }
    };
}

describe('route', function () {

    var app;

    before(function () {
        //connect fhirgoose to mongodb
        mongoose.connect('mongodb://localhost/fhirball-test');

        //create app using fhirball router to provide fhir rest api
        app = express();
        app.use(testcase.route, new fhirball.Router(testcase.conformance, testcase.profiles_path, testcase.valuesets_path));

        //start the app
        app.listen(1337);
    });


    describe('/', function () {
        it('GET should return Conformance resource', function (done) {
            var path = testcase.route;
            request(app)
                .get(path)
                .expect(200)
                .expect('content-type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                    if (err) return callback(err);

                    expect(res.body.resourceType).to.be('Conformance');

                    done();
                });
        });
    });

    describe('/metadata', function () {
        it('GET should return Conformance resource', function (done) {
            var path = testcase.route + 'metadata';
            request(app)
                .get(path)
                .expect(200)
                .expect('content-type', 'application/json; charset=utf-8')
                .end(function (err, res) {
                    if (err) return callback(err);

                    expect(res.body.resourceType).to.be('Conformance');

                    done();
                });
        });
    });

    testcase.conformance.rest[0].resource.forEach(function (resource) {
        describe(resource.type, function () {
            it('GET /' + resource.type + ' should return Bundle', function (done) {
                var path = testcase.route + resource.type;
                request(app)
                    .get(path)
                    .expect(200)
                    .expect('content-type', 'application/json; charset=utf-8')
                    .end(function (err, res) {
                        if (err) return done(err);

                        done();
                    });
            });

            describe('POST, GET, PUT, DELETE /' + resource.type + ' should enable resource creation, retrieval, update, deletion', function () {

                before(clearCollection(resource.type));
                after(clearCollection(resource.type));

                var path = testcase.resources_path + '/wellformed/' + resource.type;
                if (fs.existsSync(path)) {
                    fs.readdirSync(path).forEach(function (file) {
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
                                    .expect('location', /.*/)
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
                                    .expect('content-type', 'application/json; charset=utf-8')
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
                                        callback('Retrieved document does not match input');
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
                                    .expect('content-location', /.*/)
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
                                //TODO: checkRetrievedResource,
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




