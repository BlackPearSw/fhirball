var parser = require('./../../../lib/fhir/parser');

var fs = require('fs');
var file = __dirname + '/../data/profiles/foo.profile.xml';
var expect = require('expect.js');

describe('fhir.parser', function () {
    var xml;
    before(function (done) {
        fs.readFile(file, {encoding: 'utf8'}, function (err, data) {
            if (err) return done(err);

            xml = data;
            done();
        });
    });

    describe('fromXml', function () {
        it('should return the resource as an object', function () {
            var resource = parser.fromXml(xml);

            expect(resource).to.be.ok();
            expect(resource).to.be.an('object');

            expect(resource.resourceType).to.be.a('string');
            expect(resource.resourceType).to.be('Profile');

            expect(resource.text).to.be.ok();
            expect(resource.text.div).to.be.ok();
            expect(resource.text.div).to.be.a('string');

            expect(resource.structure).to.be.an('object');
            expect(resource.structure.type).to.be('Foo');
            expect(resource.structure.element).to.be.an('array');
        });
    });
});