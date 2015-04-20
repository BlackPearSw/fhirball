var interactions = require('./../../../lib/RouteFactory/interactions');


var mongoose = require('mongoose');
var httpMocks = require('node-mocks-http');
var sinon = require('sinon');
var should = require('chai').should();
var Promise = require('bluebird');

function Fake(name) {
    var fake = function (obj) {
        var instance = obj; //decorate existing object

        //fake instance methods and wrap in a sinon spy
        instance.save = function (callback) {
            return callback(null, obj);
        };
        instance.save = sinon.spy(instance, 'save');

        instance.toObject = function () {
            return obj;
        };


        fake.instance.push(instance);

        return instance;
    };

    //fake class methods
    fake.instance = [];
    fake.findOneAndRemove = function (criteria, callback) {
        var doc = {
            _id: criteria._id,
            meta: {
                id: criteria._id,
                versionId: '2',
                lastUpdated: '2014-11-25 22:23:01.434Z',
                user: 'creator@system'
            },
            resource: {
                resourceType: name,
                bar: 'fubar'
            }
        };
        doc = fake(doc);
        return callback(null, doc);
    };
    fake.findOneAndRemoveAsync = Promise.promisify(fake.findOneAndRemove);
    sinon.spy(fake, 'findOneAndRemoveAsync');

    fake.findOneAndUpdateWithOptimisticConcurrencyCheck = function(obj, callback){
        var doc = {
            _id: obj._id,
            meta: {
                id: obj._id.toHexString(),
                versionId: '1',
                lastUpdated: '2014-11-25 22:23:01.434Z',
                user: 'creator@system'
            },
            resource: {
                resourceType: name,
                bar: 'fubar'
            }
        };
        doc = fake(doc);
        return callback(null, doc);
    };
    fake.findOneAndUpdateWithOptimisticConcurrencyCheckAsync = Promise.promisify(fake.findOneAndUpdateWithOptimisticConcurrencyCheck);
    sinon.spy(fake, 'findOneAndUpdateWithOptimisticConcurrencyCheckAsync');

    return fake;
}

Fake.prototype = {};


describe('interaction', function () {

    var instance;

    var options = {};

    beforeEach(function () {
        options.model = new Fake('Foo');
        options.auditModel = new Fake('~Foo');

    });

    describe('create', function () {
        function simulateRequest(func, test) {
            var req = httpMocks.createRequest(
                {
                    headers: {
                        'content-type': 'application/json'
                    },
                    params: {},
                    body: instance
                });

            //decorate request to simulate middleware
            req.user = 'creator@system';

            var res = httpMocks.createResponse();
            res.statusCode = 0;

            func(req, res);

            setTimeout(function () {
                test(req, res);
            }, 100);
        }

        it('should save document', function (done) {
            var interaction = interactions.create(options.model, 'application/json', [], options.auditModel);
            var expectation = function (req, res) {
                options.model.instance.length.should.equal(1);
                options.model.instance[0].save.calledOnce.should.be.ok();

                res.statusCode.should.equal(201);
                done();
            };

            simulateRequest(interaction, expectation);
        });

        describe('audit entry', function () {
            it('should be saved', function (done) {
                var interaction = interactions.create(options.model, 'application/json', [], options.auditModel);
                var expectation = function (req, res) {
                    options.auditModel.instance.length.should.equal(1);

                    var auditDoc = options.auditModel.instance[0];
                    auditDoc.save.calledOnce.should.be.ok();

                    done();
                };

                simulateRequest(interaction, expectation);
            });

            it('should have meta.id matching main document', function (done) {
                var interaction = interactions.create(options.model, 'application/json', [], options.auditModel);
                var expectation = function (req, res) {
                    var doc = options.model.instance[0];
                    var auditDoc = options.auditModel.instance[0];

                    should.exist(auditDoc.meta.id);
                    auditDoc.meta.id.should.equal(doc.meta.id);

                    done();
                };

                simulateRequest(interaction, expectation);
            });

            it('should have meta.versionId of 0', function (done) {
                var interaction = interactions.create(options.model, 'application/json', [], options.auditModel);
                var expectation = function (req, res) {
                    var auditDoc = options.auditModel.instance[0];

                    should.exist(auditDoc.meta.versionId);
                    auditDoc.meta.versionId.should.equal('0');

                    done();
                };

                simulateRequest(interaction, expectation);
            });

            it('should have meta.lastUpdated within 1s of current', function (done) {
                var interaction = interactions.create(options.model, 'application/json', [], options.auditModel);
                var expectation = function (req, res) {
                    var auditDoc = options.auditModel.instance[0];

                    should.exist(auditDoc.meta.lastUpdated);

                    var updated = new Date(auditDoc.meta.lastUpdated);
                    //TODO: check updated is a sensible value wrt now

                    done();
                };

                simulateRequest(interaction, expectation);
            });

            it('should have meta.user taken from req.user', function (done) {
                var interaction = interactions.create(options.model, 'application/json', [], options.auditModel);
                var expectation = function (req, res) {
                    var auditDoc = options.auditModel.instance[0];

                    should.exist(auditDoc.meta.user);
                    auditDoc.meta.user.should.equal(req.user);

                    done();
                };

                simulateRequest(interaction, expectation);
            });
        });
    });

    describe('update', function () {
        function simulateRequest(func, test) {
            var id = (new mongoose.Types.ObjectId()).toHexString();
            var req = httpMocks.createRequest(
                {
                    headers: {
                        'content-type': 'application/json',
                        'content-location': 'https://host/fhir/Foo/' + id
                    },
                    params: {
                        id: id
                    },
                    body: instance
                });

            //decorate request to simulate middleware
            req.user = 'updater@system';

            var res = httpMocks.createResponse();
            res.statusCode = 0;

            func(req, res);

            setTimeout(function () {
                test(req, res);
            }, 100);
        }

        it('should update document', function (done) {
            var interaction = interactions.update(options.model, 'application/json', [], options.auditModel);
            var expectation = function (req, res) {
                options.model.instance.length.should.equal(2);
                options.model.findOneAndUpdateWithOptimisticConcurrencyCheckAsync.calledOnce.should.be.ok();

                res.statusCode.should.equal(200);
                done();
            };

            simulateRequest(interaction, expectation);
        });

        describe('audit entry', function () {
            it('should be saved', function (done) {
                var interaction = interactions.update(options.model, 'application/json', [], options.auditModel);
                var expectation = function (req, res) {
                    options.auditModel.instance.length.should.equal(1);

                    var auditDoc = options.auditModel.instance[0];
                    auditDoc.save.calledOnce.should.be.ok();

                    done();
                };

                simulateRequest(interaction, expectation);
            });

            it('should have meta.id matching main document', function (done) {
                var interaction = interactions.update(options.model, 'application/json', [], options.auditModel);
                var expectation = function (req, res) {
                    var doc = options.model.instance[0];
                    var auditDoc = options.auditModel.instance[0];

                    should.exist(auditDoc.meta.id);
                    auditDoc.meta.id.should.equal(doc.meta.id);

                    done();
                };

                simulateRequest(interaction, expectation);
            });

            it('should have meta.versionId of 0', function (done) {
                var interaction = interactions.update(options.model, 'application/json', [], options.auditModel);
                var expectation = function (req, res) {
                    var auditDoc = options.auditModel.instance[0];

                    should.exist(auditDoc.meta.versionId);
                    auditDoc.meta.versionId.should.equal('1');

                    done();
                };

                simulateRequest(interaction, expectation);
            });

            it('should have meta.lastUpdated within 1s of current', function (done) {
                var interaction = interactions.update(options.model, 'application/json', [], options.auditModel);
                var expectation = function (req, res) {
                    var auditDoc = options.auditModel.instance[0];

                    should.exist(auditDoc.meta.lastUpdated);

                    var updated = new Date(auditDoc.meta.lastUpdated);
                    //TODO: check updated is a sensible value wrt now

                    done();
                };

                simulateRequest(interaction, expectation);
            });

            it('should have meta.user taken from req.user', function (done) {
                var interaction = interactions.update(options.model, 'application/json', [], options.auditModel);
                var expectation = function (req, res) {
                    var auditDoc = options.auditModel.instance[0];

                    should.exist(auditDoc.meta.user);
                    auditDoc.meta.user.should.equal(req.user);

                    done();
                };

                simulateRequest(interaction, expectation);
            });
        });
    });


    describe('delete', function () {
        var options = {};

        beforeEach(function () {
            options.model = new Fake('Foo');
            options.model.instance.push();
            options.auditModel = new Fake('~Foo');
        });

        function simulateRequest(func, test) {
            var req = httpMocks.createRequest(
                {
                    headers: {
                        'content-type': 'application/json'
                    },
                    params: {
                        id: (new mongoose.Types.ObjectId()).toHexString()
                    }
                });

            //decorate request to simulate middleware
            req.user = 'creator@system';

            var res = httpMocks.createResponse();
            res.statusCode = 0;

            func(req, res);

            setTimeout(function () {
                test(req, res);
            }, 100);
        }

        it('should delete document', function (done) {
            var interaction = interactions.delete(options.model, 'application/json', [], options.auditModel);
            var expectation = function (req, res) {
                options.model.instance.length.should.equal(1);
                options.model.findOneAndRemoveAsync.calledOnce.should.be.ok();

                res.statusCode.should.equal(204);
                done();
            };

            simulateRequest(interaction, expectation);
        });

        describe('audit entry', function () {
            it('should be deleted', function (done) {
                var interaction = interactions.delete(options.model, 'application/json', [], options.auditModel);
                var expectation = function (req, res) {
                    options.auditModel.instance.length.should.equal(1);

                    var auditDoc = options.auditModel.instance[0];
                    auditDoc.save.calledOnce.should.be.ok();

                    done();
                };

                simulateRequest(interaction, expectation);
            });

            it('should have meta.id matching main document', function (done) {
                var interaction = interactions.delete(options.model, 'application/json', [], options.auditModel);
                var expectation = function (req, res) {
                    var doc = options.model.instance[0];
                    var auditDoc = options.auditModel.instance[0];

                    should.exist(auditDoc.meta.id);
                    auditDoc.meta.id.should.equal(doc.meta.id);

                    done();
                };

                simulateRequest(interaction, expectation);
            });

            it('should have meta.versionId', function (done) {
                var interaction = interactions.delete(options.model, 'application/json', [], options.auditModel);
                var expectation = function (req, res) {
                    var auditDoc = options.auditModel.instance[0];

                    should.exist(auditDoc.meta.versionId);
                    auditDoc.meta.versionId.should.equal('2');

                    done();
                };

                simulateRequest(interaction, expectation);
            });

            it('should not have meta.lastUpdated', function (done) {
                var interaction = interactions.delete(options.model, 'application/json', [], options.auditModel);
                var expectation = function (req, res) {
                    var auditDoc = options.auditModel.instance[0];

                    should.not.exist(auditDoc.meta.lastUpdated);

                    done();
                };

                simulateRequest(interaction, expectation);
            });

            it('should have deleted within 1s of current', function (done) {
                var interaction = interactions.delete(options.model, 'application/json', [], options.auditModel);
                var expectation = function (req, res) {
                    var auditDoc = options.auditModel.instance[0];

                    should.exist(auditDoc.meta.deleted);

                    var deleted = new Date(auditDoc.meta.deleted);
                    //TODO: check updated is a sensible value wrt now

                    done();
                };

                simulateRequest(interaction, expectation);
            });

            it('should have meta.user taken from req.user', function (done) {
                var interaction = interactions.delete(options.model, 'application/json', [], options.auditModel);
                var expectation = function (req, res) {
                    var auditDoc = options.auditModel.instance[0];

                    should.exist(auditDoc.meta.user);
                    auditDoc.meta.user.should.equal(req.user);

                    done();
                };

                simulateRequest(interaction, expectation);
            });

            it('should have resource.resourceType only', function (done) {
                var interaction = interactions.delete(options.model, 'application/json', [], options.auditModel);
                var expectation = function (req, res) {
                    var auditDoc = options.auditModel.instance[0];

                    should.exist(auditDoc.resource);
                    should.exist(auditDoc.resource.resourceType);
                    auditDoc.resource.resourceType.should.equal('Foo');

                    done();
                };

                simulateRequest(interaction, expectation);
            });
        });
    });
});