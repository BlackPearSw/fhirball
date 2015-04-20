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
                    meta: {
                        id: '123',
                        versionId: '0',
                        lastUpdated: '2012-05-29T23:45:32+00:00'
                    },
                    resource: {
                        resourceType: 'Foo',
                        value: 'one'
                    }
                },
                {
                    tags: [],
                    meta: {
                        id: '234',
                        versionId: '1',
                        lastUpdated: '2012-06-29T23:45:32+00:00'
                    },
                    resource: {
                        resourceType: 'Bar',
                        value: 'one'
                    }
                },
                {
                    meta: {
                        id: '345',
                        versionId: '5',
                        lastUpdated: '2012-07-29T23:45:32+00:00'
                    },
                    resource: {
                        resourceType: 'Bar',
                        value: 'two'
                    }
                },
                {
                    meta: {
                        id: '456',
                        versionId: '5',
                        lastUpdated: '2012-07-29T23:45:32+00:00',
                        deleted: '2012-07-29T23:45:32+00:00'
                    },
                    resource: {
                        resourceType: 'Bar'
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
            expect(bundle.entry.length).to.be(4);

            expect(bundle.entry[0].category.length).to.be(1);
            expect(bundle.entry[1].category.length).to.be(0);
            expect(bundle.entry[2].category.length).to.be(0);

            expect(bundle.entry[0].id).to.be('123');
            expect(bundle.entry[1].id).to.be('234');
            expect(bundle.entry[2].id).to.be('345');
            expect(bundle.entry[3].id).to.be('456');

            expect(bundle.entry[0].content.resourceType).to.be('Foo');

            expect(bundle.entry[0].link.length).to.be(1);
            expect(bundle.entry[0].link[0].rel).to.be('self');
            expect(bundle.entry[0].link[0].href).to.be('Foo/123/_history/0');

            expect(bundle.entry[0].updated).to.be('2012-05-29T23:45:32+00:00');

            expect(bundle.entry[3].content).to.be(undefined);
            expect(bundle.entry[3].deleted).to.be('2012-07-29T23:45:32+00:00');

        });
    });
});