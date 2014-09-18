var ValueSetDictionary = require('./../../lib/SchemaFactory/ValueSetDictionary');

var settings = require('./../settings');
var expect = require('expect.js');
var types = require('./../../lib/fhir/types');

describe('SchemaFactory.ValueSetDictionary', function () {
    it('should be constructed without options', function () {
        var valueSetDictionary = new ValueSetDictionary();

        expect(valueSetDictionary).to.be.ok();

    });

    describe('load', function () {
        it('should reject promise if path undefined', function (done) {
            var valueSetDictionary = new ValueSetDictionary();
            valueSetDictionary.load()
                .then(function () {
                    done(new Error('Expected to reject promise'));
                })
                .catch(function (err) {
                    done();
                });
        });

        it('should load valuesets from path', function (done) {
            var valueSetDictionary = new ValueSetDictionary();
            valueSetDictionary.load(settings.valuesets_path)
                .then(function () {
                    expect(valueSetDictionary).to.have.property('http://hl7.org/fhir/vs/administrative-gender');
                    expect(valueSetDictionary['http://hl7.org/fhir/vs/administrative-gender']).to.be.ok();
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });


})
;