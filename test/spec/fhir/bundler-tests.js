var bundler = require('./../../../lib/fhir/bundler');

var expect = require('expect.js');

describe('fhir.bundler', function () {

    describe('make', function () {
        it('should return the docs as a bundle', function () {
            var docs = [
                { resourceType: 'Foo',
                    value: 'one'
                },
                { resourceType: 'Bar',
                    value: 'one'
                },
                { resourceType: 'Bar',
                    value: 'two'
                }
            ];

            var bundle = bundler.make(docs);

            expect(bundle).to.be.ok();
            expect(bundle).to.be.an('object');
            expect(bundle.resourceType).to.be('Bundle');

            expect(bundle.entry).to.be.an('array');
            expect(bundle.entry.length).to.be(3);

            expect(bundle.entry[0].content.resourceType).to.be('Foo');
        });
    });
});