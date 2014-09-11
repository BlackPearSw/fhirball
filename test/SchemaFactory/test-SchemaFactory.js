var SchemaFactory = require('../../lib/SchemaFactory/index');
var types = require('../../lib/fhir/types');

var settings = require('./../settings');
var expect = require('expect.js');

describe('SchemaFactory', function () {
    it('should be constructed without options', function () {
        var factory = new SchemaFactory();

        expect(factory).to.be.ok();
    });

    describe('make', function () {
        var factory = new SchemaFactory();

        it('should throw an exception if no path defined', function (done) {
            factory.make()
                .catch(function () {
                    done();
                });
        });

        it('should promise a schema object', function (done) {

            var profile = settings.TEST_PROFILE_PATH;
            factory.make(profile)
                .then(function (schema) {
                    expect(schema).to.be.ok();
                    expect(schema).to.be.an('object');

                    done()
                })
                .catch(function (reason) {
                    done(reason);
                });
        });

        describe('schema for Foo', function () {
            var factory = new SchemaFactory();
            var profile = settings.TEST_PROFILE_PATH;
            var schema;
            before(function (done) {
                    factory.make(profile)
                        .then(function (data) {
                            schema = data;
                            done();
                        })
                        .catch(function (reason) {
                            done(reason);
                        });
                }
            );

            it('should define resourceType with type fhir.string and match constraint', function () {
                expect(schema).to.have.property('resourceType');
                expect(schema.resourceType.type).to.be(types.string);
                expect(schema.resourceType.match.source).to.be("^Foo$");
            });

            it('should define leaf with type fhir.string', function () {
                expect(schema).to.have.property('leaf');
                expect(schema.leaf).to.be(types.string);
            });

            it('should define bool with type fhir.boolean', function () {
                expect(schema).to.have.property('bool');
                expect(schema.bool).to.be(types.boolean);
            });

            it('should define period with type fhir.Period', function () {
                expect(schema).to.have.property('period');
                expect(schema.period).to.be(types.Period);
            });

            it('should define branch as nested type', function () {
                expect(schema).to.have.property('branch');
                expect(schema.branch).to.be.an('object');
            });

            it('should define branch.leaf_1 as fhir.string', function () {
                expect(schema.branch).to.have.property('leaf_1');
                expect(schema.branch.leaf_1).to.be(types.string);
            });

            it('should define branch.branch_1 as nested type', function () {
                expect(schema.branch).to.have.property('branch_1');
                expect(schema.branch.branch_1).to.be.an('object');
            });

            it('should define branch.branch_1.leaf_2 as fhir.string', function () {
                expect(schema.branch.branch_1).to.have.property('leaf_2');
                expect(schema.branch.branch_1.leaf_2).to.be(types.string);
            });

            it('should define collection_1 as array', function () {
                expect(schema).to.have.property('collection_1');
                expect(schema.collection_1).to.be.an('array');
                expect(schema.collection_1[0]).to.be(types.string);
            });

            it('should define collection_2 as array', function () {
                expect(schema).to.have.property('collection_2');
                expect(schema.collection_2).to.be.an('array');
                expect(schema.collection_2[0]).to.be.an('object');
            });

            it('should define collection_2.leaf_3 as array', function () {
                expect(schema.collection_2[0]).to.have.property('leaf_3');
                expect(schema.collection_2[0].leaf_3).to.be(types.string);
            });
        });
    });
});