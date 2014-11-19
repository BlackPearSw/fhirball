var bundler = require('./../../../lib/fhir/bundler');

var expect = require('expect.js');

describe('fhir.bundler', function () {

    describe('make', function () {
        it('should return the docs as a bundle', function () {
            var docs = [
                {
                    tags: [
                        {
                            "term": "TERM",
                            "label": "LABEL",
                            "scheme": "SCHEME"
                        }
                    ],
                    resource: {
                        resourceType: 'Foo',
                        value: 'one'
                    }
                },
                {
                    tags: [],
                    resource: {
                        resourceType: 'Bar',
                        value: 'one'
                    }
                },
                {
                    resource: {
                        resourceType: 'Bar',
                        value: 'two'
                    }
                }
            ];
            var title = 'test bundle';
            var link = [];

            var bundle = bundler.make(docs, title, link);

            expect(bundle).to.be.ok();
            expect(bundle).to.be.an('object');
            expect(bundle.resourceType).to.be('Bundle');
            expect(bundle.title).to.be(title);
            expect(bundle.link).to.be(link);

            expect(bundle.entry).to.be.an('array');
            expect(bundle.entry.length).to.be(3);

            expect(bundle.entry[0].category.length).to.be(1);
            expect(bundle.entry[1].category.length).to.be(0);
            expect(bundle.entry[2].category.length).to.be(0);

            expect(bundle.entry[0].content.resourceType).to.be('Foo');


        });
    });
});