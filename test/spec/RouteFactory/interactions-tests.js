const interactions = require('./../../../lib/RouteFactory/interactions');
const mongoose = require('mongoose');
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const should = require('chai').should();

function Fake(name) {
    const fake = function (obj) {
        const instance = obj; //decorate existing object
        //fake instance methods and wrap in a sinon spy
        instance.save = function () {
            return Promise.resolve(obj);
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
    fake.findOneAndRemove = function (criteria) {
        let doc = {
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
        return {
            exec: function () {
                return Promise.resolve(doc);
            }
        }
    };
    sinon.spy(fake, 'findOneAndRemove');
    fake.findOneAndUpdateWithOptimisticConcurrencyCheck = function (obj) {
        let doc = {
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
        return Promise.resolve(doc);
    };
    sinon.spy(fake, 'findOneAndUpdateWithOptimisticConcurrencyCheck');
    return fake;
}

Fake.prototype = {};

describe('interaction', function () {

    let instance;
    let options = {};

    beforeEach(function () {
        options.model = new Fake('Foo');
        options.auditModel = new Fake('~Foo');

    });

    describe('create', function () {
        function simulateRequest(func, test) {
            const req = httpMocks.createRequest(
                {
                    headers: {
                        'content-type': 'application/json'
                    },
                    params: {},
                    body: instance
                });

            //decorate request to simulate middleware
            req.user = 'creator@system';
            const res = httpMocks.createResponse();
            res.statusCode = 0;

            func(req, res);

            setTimeout(function () {
                test(req, res);
            }, 100);
        }

        it('should save document', function (done) {
            const interaction = interactions.create(options.model, 'application/json', [], options.auditModel);
            const expectation = function (req, res) {
                options.model.instance.length.should.equal(1);
                options.model.instance[0].save.calledOnce.should.be.true;
                res.statusCode.should.equal(201);
                done();
            };
            simulateRequest(interaction, expectation);
        });

        describe('audit entry', function () {
            it('should be saved', function (done) {
                const interaction = interactions.create(options.model, 'application/json', [], options.auditModel);
                const expectation = function (req, res) {
                    options.auditModel.instance.length.should.equal(1);
                    const auditDoc = options.auditModel.instance[0];
                    auditDoc.save.calledOnce.should.be.true;
                    done();
                };
                simulateRequest(interaction, expectation);
            });

            it('should have meta.id matching main document', function (done) {
                const interaction = interactions.create(options.model, 'application/json', [], options.auditModel);
                const expectation = function (req, res) {
                    const doc = options.model.instance[0];
                    const auditDoc = options.auditModel.instance[0];
                    should.exist(auditDoc.meta.id);
                    auditDoc.meta.id.should.equal(doc.meta.id);
                    done();
                };
                simulateRequest(interaction, expectation);
            });

            it('should have meta.versionId of 0', function (done) {
                const interaction = interactions.create(options.model, 'application/json', [], options.auditModel);
                const expectation = function (req, res) {
                    const auditDoc = options.auditModel.instance[0];
                    should.exist(auditDoc.meta.versionId);
                    auditDoc.meta.versionId.should.equal('0');
                    done();
                };
                simulateRequest(interaction, expectation);
            });

            it('should have meta.lastUpdated within 1s of current', function (done) {
                const interaction = interactions.create(options.model, 'application/json', [], options.auditModel);
                const expectation = function (req, res) {
                    const auditDoc = options.auditModel.instance[0];
                    should.exist(auditDoc.meta.lastUpdated);
                    const updated = new Date(auditDoc.meta.lastUpdated);
                    //TODO: check updated is a sensible value wrt now
                    done();
                };
                simulateRequest(interaction, expectation);
            });

            it('should have meta.user taken from req.user', function (done) {
                const interaction = interactions.create(options.model, 'application/json', [], options.auditModel);
                const expectation = function (req, res) {
                    const auditDoc = options.auditModel.instance[0];
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
            const id = (new mongoose.Types.ObjectId()).toHexString();
            const req = httpMocks.createRequest(
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
            const res = httpMocks.createResponse();
            res.statusCode = 0;
            func(req, res);
            setTimeout(function () {
                test(req, res);
            }, 100);
        }

        it('should update document', function (done) {
            const interaction = interactions.update(options.model, 'application/json', [], options.auditModel);
            const expectation = function (req, res) {
                options.model.instance.length.should.equal(2);
                options.model.findOneAndUpdateWithOptimisticConcurrencyCheck.calledOnce.should.be.true;
                res.statusCode.should.equal(200);
                done();
            };
            simulateRequest(interaction, expectation);
        });

        describe('audit entry', function () {
            it('should be saved', function (done) {
                const interaction = interactions.update(options.model, 'application/json', [], options.auditModel);
                const expectation = function (req, res) {
                    options.auditModel.instance.length.should.equal(1);
                    const auditDoc = options.auditModel.instance[0];
                    auditDoc.save.calledOnce.should.be.true;
                    done();
                };
                simulateRequest(interaction, expectation);
            });

            it('should have meta.id matching main document', function (done) {
                const interaction = interactions.update(options.model, 'application/json', [], options.auditModel);
                const expectation = function (req, res) {
                    const doc = options.model.instance[0];
                    const auditDoc = options.auditModel.instance[0];
                    should.exist(auditDoc.meta.id);
                    auditDoc.meta.id.should.equal(doc.meta.id);
                    done();
                };
                simulateRequest(interaction, expectation);
            });

            it('should have meta.versionId of 0', function (done) {
                const interaction = interactions.update(options.model, 'application/json', [], options.auditModel);
                const expectation = function (req, res) {
                    const auditDoc = options.auditModel.instance[0];
                    should.exist(auditDoc.meta.versionId);
                    auditDoc.meta.versionId.should.equal('1');
                    done();
                };
                simulateRequest(interaction, expectation);
            });

            it('should have meta.lastUpdated within 1s of current', function (done) {
                const interaction = interactions.update(options.model, 'application/json', [], options.auditModel);
                const expectation = function (req, res) {
                    const auditDoc = options.auditModel.instance[0];
                    should.exist(auditDoc.meta.lastUpdated);
                    const updated = new Date(auditDoc.meta.lastUpdated);
                    //TODO: check updated is a sensible value wrt now
                    done();
                };
                simulateRequest(interaction, expectation);
            });

            it('should have meta.user taken from req.user', function (done) {
                const interaction = interactions.update(options.model, 'application/json', [], options.auditModel);
                const expectation = function (req, res) {
                    const auditDoc = options.auditModel.instance[0];

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
            const req = httpMocks.createRequest(
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
            const res = httpMocks.createResponse();
            res.statusCode = 0;
            func(req, res);
            setTimeout(function () {
                test(req, res);
            }, 100);
        }

        it('should delete document', function (done) {
            const interaction = interactions.delete(options.model, 'application/json', [], options.auditModel);
            const expectation = function (req, res) {
                options.model.instance.length.should.equal(1);
                options.model.findOneAndRemove.calledOnce.should.be.true;
                res.statusCode.should.equal(204);
                done();
            };
            simulateRequest(interaction, expectation);
        });

        describe('audit entry', function () {
            it('should be deleted', function (done) {
                const interaction = interactions.delete(options.model, 'application/json', [], options.auditModel);
                const expectation = function (req, res) {
                    options.auditModel.instance.length.should.equal(1);
                    const auditDoc = options.auditModel.instance[0];
                    auditDoc.save.calledOnce.should.be.true;
                    done();
                };

                simulateRequest(interaction, expectation);
            });

            it('should have meta.id matching main document', function (done) {
                const interaction = interactions.delete(options.model, 'application/json', [], options.auditModel);
                const expectation = function (req, res) {
                    const doc = options.model.instance[0];
                    const auditDoc = options.auditModel.instance[0];

                    should.exist(auditDoc.meta.id);
                    auditDoc.meta.id.should.equal(doc.meta.id);
                    done();
                };
                simulateRequest(interaction, expectation);
            });

            it('should have meta.versionId', function (done) {
                const interaction = interactions.delete(options.model, 'application/json', [], options.auditModel);
                const expectation = function (req, res) {
                    const auditDoc = options.auditModel.instance[0];

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
                const interaction = interactions.delete(options.model, 'application/json', [], options.auditModel);
                const expectation = function (req, res) {
                    const auditDoc = options.auditModel.instance[0];
                    should.exist(auditDoc.meta.deleted);

                    const deleted = new Date(auditDoc.meta.deleted);
                    //TODO: check updated is a sensible value wrt now
                    done();
                };

                simulateRequest(interaction, expectation);
            });

            it('should have meta.user taken from req.user', function (done) {
                const interaction = interactions.delete(options.model, 'application/json', [], options.auditModel);
                const expectation = function (req, res) {
                    const auditDoc = options.auditModel.instance[0];

                    should.exist(auditDoc.meta.user);
                    auditDoc.meta.user.should.equal(req.user);

                    done();
                };

                simulateRequest(interaction, expectation);
            });

            it('should have resource.resourceType only', function (done) {
                const interaction = interactions.delete(options.model, 'application/json', [], options.auditModel);
                const expectation = function (req, res) {
                    const auditDoc = options.auditModel.instance[0];

                    should.exist(auditDoc.resource);
                    should.exist(auditDoc.resource.resourceType);
                    auditDoc.resource.resourceType.should.equal('Foo');

                    done();
                };

                simulateRequest(interaction, expectation);
            });
        });
    });

    describe('location and content-location headers', function () {
        function simulateRequest(func, test) {
            const req = httpMocks.createRequest(
                {
                    headers: {
                        'content-type': 'application/json',
                        'host': 'foo.bar.com'
                    },
                    params: {},
                    body: instance
                });

            //decorate request to simulate express
            req.protocol = 'https';

            //decorate request to simulate middleware
            req.user = 'creator@system';

            const res = httpMocks.createResponse();
            res.statusCode = 0;

            func(req, res);

            setTimeout(function () {
                test(req, res);
            }, 100);
        }

        function simulateForwardedRequest(func, test) {
            const req = httpMocks.createRequest(
                {
                    headers: {
                        'content-type': 'application/json',
                        'host': 'foo.bar.com',
                        'x-forwarded-proto': 'https'
                    },
                    params: {},
                    body: instance
                });

            //decorate request to simulate express
            req.protocol = 'http';

            //decorate request to simulate middleware
            req.user = 'creator@system';

            var res = httpMocks.createResponse();
            res.statusCode = 0;

            func(req, res);

            setTimeout(function () {
                test(req, res);
            }, 100);
        }

        it('should use host in header', function (done) {
            const interaction = interactions.create(options.model, 'application/json', [], options.auditModel);
            const expectation = function (req, res) {
                options.model.instance.length.should.equal(1);
                options.model.instance[0].save.calledOnce.should.be.true;

                res.getHeader('Location').should.match(/^https:\/\/foo.bar.com/);
                done();
            };

            simulateRequest(interaction, expectation);
        });

        it('should use host in header when request forwarded by proxy', function (done) {
            const interaction = interactions.create(options.model, 'application/json', [], options.auditModel);
            const expectation = function (req, res) {
                options.model.instance.length.should.equal(1);
                options.model.instance[0].save.calledOnce.should.be.true;

                res.getHeader('Location').should.match(/^https:\/\/foo.bar.com/);
                done();
            };

            simulateForwardedRequest(interaction, expectation);
        });
    });
});