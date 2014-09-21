var ModelFactory = require('../../lib/ModelFactory/index');

var settings = require('./../settings');
var ValueSetDictionary = require('../../lib/SchemaFactory/ValueSetDictionary');
var SchemaFactory = require('../../lib/SchemaFactory/index');
var expect = require('expect.js');
var mongoose = require('mongoose');

describe('ModelFactory', function () {
    it('should be constructed without options', function () {
        var factory = new ModelFactory();

        expect(factory).to.be.ok();
    });

    describe('make', function () {
        var factory = new ModelFactory();
        var schema;

        before(function (done) {
            var valueSetDictionary = new ValueSetDictionary();
            var profile = settings.TEST_PROFILE_PATH;
            var factory = new SchemaFactory();
            valueSetDictionary.load(settings.valuesets_path)
                .then(function(){
                    factory.make(profile, valueSetDictionary)
                        .then(function (data) {
                            schema = data;
                            done();
                        })
                        .catch(function(reason){
                            done(reason);
                        });
                })
                .catch(function(reason){
                    done(reason);
                });
        });

        it('should throw an exception if no type defined', function (done) {
            factory.make()
                .catch(function(){
                    done();
                });
        });

        it('should throw an exception if no schema defined', function (done) {
            factory.make('Foo')
                .catch(function(){
                    done();
                });
        });

        it('should resolve promise with mongoose model', function (done) {
            factory.make('Foo', schema)
                .then(function(model){
                    expect(model).to.be.ok();
                    expect(model).to.be.a('function');
                    expect(model.modelName).to.be('Foo');
                    expect(model.findOneAndUpdateWithOptimisticConcurrencyCheck).to.be.a('function');

                    done();
                })
                .catch(function(reason){
                    done(reason);
                });
        });

        it('should reject promise if schema is invalid', function (done) {
            var badSchema = {
                foo: String,
                bar: {
                    type: undefined
                }

            };
            factory.make('Foo', badSchema)
                .then(function(){
                    done(new Error('expected promise to be rejected'));
                })
                .catch(function(reason){
                    expect(reason).to.be.ok();
                    done();
                });
        });
    });
});