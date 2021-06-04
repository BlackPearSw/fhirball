var bundler = require('./../../../lib/fhir/bundler');
var expect = require('chai').expect;

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
                },
                {
                    meta: {
                        id: '567',
                        versionId: '5',
                        lastUpdated: '2012-07-29T23:45:32+00:00',
                        deleted: '2012-07-29T23:45:32+00:00'
                    },
                    resource: {
                        resourceType: 'Bundle'
                    }
                }
            ];
            var title = 'test bundle';
            var link = [];

            var bundle = bundler.make(docs, title, link);

            expect(bundle).to.exist;
            expect(bundle).to.be.an('object');
            expect(bundle.resourceType).to.equal('Bundle');
            expect(bundle.title).to.equal(title);
            expect(bundle.link).to.deep.equal(link);

            expect(bundle.entry).to.be.an('array');
            expect(bundle.entry).to.have.lengthOf(5);

            expect(bundle.entry[0].category).to.have.lengthOf(1);
            expect(bundle.entry[1].category).to.have.lengthOf(0);
            expect(bundle.entry[2].category).to.have.lengthOf(0);

            expect(bundle.entry[0].id).to.equal('123');
            expect(bundle.entry[1].id).to.equal('234');
            expect(bundle.entry[2].id).to.equal('345');
            expect(bundle.entry[3].id).to.equal('456');

            expect(bundle.entry[0].content.resourceType).to.equal('Foo');

            expect(bundle.entry[0].link).to.have.lengthOf(1);
            expect(bundle.entry[0].link[0].rel).to.equal('self');
            expect(bundle.entry[0].link[0].href).to.equal('Foo/123/_history/0');

            expect(bundle.entry[0].updated).to.equal('2012-05-29T23:45:32+00:00');

            expect(bundle.entry[3].content).to.be.undefined;
            expect(bundle.entry[3].deleted).to.equal('2012-07-29T23:45:32+00:00');

            expect(bundle.entry[4].link).to.have.lengthOf(1);
            expect(bundle.entry[4].link[0].rel).to.equal('self');
            expect(bundle.entry[4].link[0].href).to.equal('Document/567/_history/5');
        });
    });
});