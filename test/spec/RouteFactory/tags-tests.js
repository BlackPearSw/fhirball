var tags = require('./../../../lib/RouteFactory/tags');

var should = require('chai').should();

describe('tags', function () {
    describe('getCategoryHeader', function () {
        it('should return blank category header when tags undefined', function () {
            var result = tags.getCategoryHeader();

            result.should.equal('');
        });

        it('should return blank category header when no tags', function () {
            var input = [];

            var result = tags.getCategoryHeader(input);

            result.should.equal('');
        });

        it('should return category header for single tag', function () {
            var input = [
                {
                    "term": "TERM",
                    "label": "LABEL",
                    "scheme": "SCHEME"
                }
            ];

            var result = tags.getCategoryHeader(input);

            result.should.equal('TERM; scheme="SCHEME"; label="LABEL"');
        });

        it('should return category header for tag with no label', function () {
            var input = [
                {
                    "term": "TERM",
                    "scheme": "SCHEME"
                }
            ];

            var result = tags.getCategoryHeader(input);

            result.should.equal('TERM; scheme="SCHEME"');
        });

        it('should return category header for multiple tags', function () {
            var input = [
                {
                    "term": "termOne",
                    "label": "labelOne",
                    "scheme": "schemeOne"
                },
                {
                    "term": "termTwo",
                    "label": "labelTwo",
                    "scheme": "schemeTwo"
                },
                {
                    "term": "termThree",
                    "label": "labelThree",
                    "scheme": "schemeThree"
                }
            ];

            var result = tags.getCategoryHeader(input);

            result.should.equal('termOne; scheme="schemeOne"; label="labelOne",termTwo; scheme="schemeTwo"; label="labelTwo",termThree; scheme="schemeThree"; label="labelThree"');
        });
    });

    describe('parseCategoryHeader', function () {
        it('should return blank tagList when Category undefined', function () {
            var result = tags.parseCategoryHeader();

            result.should.deep.equal({
                resourceType: 'TagList',
                category: []
            });
        });

        it('should return blank tagList when Category empty', function () {
            var category = '';

            var result = tags.parseCategoryHeader(category);

            result.should.deep.equal({
                resourceType: 'TagList',
                category: []
            });
        });

        it('should return tagList for single tag', function () {
            var category = 'TERM; scheme="SCHEME"; label="LABEL"';

            var result = tags.parseCategoryHeader(category);

            result.should.deep.equal({
                resourceType: 'TagList',
                category: [
                    {
                        "term": "TERM",
                        "scheme": "SCHEME",
                        "label": "LABEL"
                    }
                ]
            });
        });

        it('should return tagList for single tag with no label', function () {
            var category = 'TERM; scheme="SCHEME"';

            var result = tags.parseCategoryHeader(category);

            result.should.deep.equal({
                resourceType: 'TagList',
                category: [
                    {
                        "term": "TERM",
                        "scheme": "SCHEME"
                    }
                ]
            });
        });

        it('should return tagList for multiple tags', function () {
            var category = 'termOne; scheme="schemeOne"; label="labelOne",termTwo; scheme="schemeTwo"; label="labelTwo",termThree; scheme="schemeThree"; label="labelThree"';

            var result = tags.parseCategoryHeader(category);

            result.should.deep.equal({
                resourceType: 'TagList',
                category: [
                    {
                        "term": "termOne",
                        "label": "labelOne",
                        "scheme": "schemeOne"
                    },
                    {
                        "term": "termTwo",
                        "label": "labelTwo",
                        "scheme": "schemeTwo"
                    },
                    {
                        "term": "termThree",
                        "label": "labelThree",
                        "scheme": "schemeThree"
                    }
                ]
            });
        });
    });

    describe('getTagList', function () {
        it('should return blank tagList when tags undefined', function () {
            var result = tags.getTagList();

            result.should.deep.equal({
                resourceType: 'TagList',
                category: []
            });
        });

        it('should return blank tagList when no tags', function () {
            var input = [];

            var result = tags.getTagList(input);

            result.should.deep.equal({
                resourceType: 'TagList',
                category: []
            });
        });

        it('should return tagList for single tag', function () {
            var input = [
                {
                    "term": "TERM",
                    "label": "LABEL",
                    "scheme": "SCHEME"
                }
            ];

            var result = tags.getTagList(input);

            result.should.deep.equal({
                resourceType: 'TagList',
                category: input
            });
        });

        it('should return tagList for tag with no label', function () {
            var input = [
                {
                    "term": "TERM",
                    "scheme": "SCHEME"
                }
            ];

            var result = tags.getTagList(input);

            result.should.deep.equal({
                resourceType: 'TagList',
                category: input
            });
        });

        it('should return tagList for multiple tags', function () {
            var input = [
                {
                    "term": "termOne",
                    "label": "labelOne",
                    "scheme": "schemeOne"
                },
                {
                    "term": "termTwo",
                    "label": "labelTwo",
                    "scheme": "schemeTwo"
                },
                {
                    "term": "termThree",
                    "label": "labelThree",
                    "scheme": "schemeThree"
                }
            ];

            var result = tags.getTagList(input);

            result.should.deep.equal({
                resourceType: 'TagList',
                category: input
            });
        });
    });
});