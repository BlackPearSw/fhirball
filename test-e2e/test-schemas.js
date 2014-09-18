var ValueSetDictionary = require('../lib/SchemaFactory/ValueSetDictionary');
var SchemaFactory = require('../lib/SchemaFactory/index');
var testcase = require('./testcases/0.0.81.js');

var fs = require('fs');
var expect = require('expect.js');
var types = require('../lib/fhir/types');
var mongoose = require('mongoose');

describe('schemas', function(){

    var factory = new SchemaFactory();
    var valueSetDictionary = new ValueSetDictionary();

    before(function(done){
        valueSetDictionary
            .load(testcase.valuesets_path)
            .then(function(){
                done();
            });
    });

    describe('Patient', function(){
        var schema;
        before(function(done){
            factory
                .make(testcase.profiles_path + '/patient.profile.xml', valueSetDictionary)
                .then(function(result){
                    schema = result;
                    done();
                });
        });

        it('should have resourceType', function(){
            expect(schema).to.have.property('resourceType');
            expect(schema.resourceType.type).to.be(types.string);
            expect(schema.resourceType.match.source).to.be("^Patient$");
        });

        it('should convert to mongoose Model', function(){
            var model = mongoose.model('Patient_', mongoose.Schema(schema));

            expect(model).to.be.ok();
        })
    });
});