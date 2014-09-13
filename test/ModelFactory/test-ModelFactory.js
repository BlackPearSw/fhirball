var ModelFactory = require('../../lib/ModelFactory/index');

var settings = require('./../settings');
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
            var profile = settings.TEST_PROFILE_PATH;
            var factory = new SchemaFactory();
            factory.make(profile)
                .then(function (data) {
                    schema = data;
                    done();
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

        it('should promise a mongoose model', function (done) {
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
    });
});