var subset = require('./compare').isSubset;

var assert = require('assert');
var mongoose = require('mongoose');

describe('compare', function () {
    describe('isSubset', function () {
        it('should return true when all properties from A are present on B and have same value', function () {
            var A = {
                foo: 'fubar',
                bar: {
                    value: 'fubarfubar'
                }
            };

            var B = {
                foo: 'fubar',
                bar: {
                    value: 'fubarfubar'
                }
            };

            assert(subset(A, B) === true);
        });

        it('should return false when a property from A is not present on B', function () {
            var A = {
                foo: 'fubar',
                bar: {
                    value: 'fubarfubar'
                }
            };

            var B = {
                foo: 'fubar',
                bar: {

                }
            };

            assert(subset(A, B) === false);

        });

        it('should return false when a property from A is present on B with a different value', function () {
            var A = {
                foo: 'fubar',
                bar: {
                    value: 'fubarfubar'
                }
            };

            var B = {
                foo: 'fubar',
                bar: {
                    value: 'bubblebubble'
                }
            };

            assert(subset(A, B) === false);

        });

        it('should return true when B has a property that A does not provide', function () {
            var A = {
                foo: 'fubar',
                bar: {
                    value: 'fubarfubar'
                }
            };

            var B = {
                foo: 'fubar',
                bar: {
                    value: 'fubarfubar',
                    toil: 'bubblebubble'
                }
            };

            assert(subset(A, B) === true);
        });

        it('should return true when a date property from A is present on B as a string or vice versa', function () {
            var A = {
                foo: 'fubar',
                bar: {
                    value: 'fubarfubar',
                    date: "1961-08-24T00:00:00.000Z"
                }
            };

            var B = {
                foo: 'fubar',
                bar: {
                    value: 'fubarfubar',
                    date: new Date("1961-08-24T00:00:00.000Z")
                }
            };

            assert(subset(A, B) === true);
        });

        it('should return true when an ObjectID property from A is present on B as a string or vice versa', function () {
            var A = {
                foo: 'fubar',
                bar: {
                    value: 'fubarfubar',
                    _id: '53c7c7c8e40766953e5bcfb2'
                }
            };

            var B = {
                foo: 'fubar',
                bar: {
                    value: 'fubarfubar',
                    _id: mongoose.Types.ObjectId('53c7c7c8e40766953e5bcfb2')
                }
            };

            assert(subset(A, B) === true);
        });

        it('should return true when a short format date from A is present in full format on B or vice versa', function () {
            var A = {
                foo: 'fubar',
                bar: {
                    value: 'fubarfubar',
                    date: '2010-05-31'
                }
            };

            var B = {
                foo: 'fubar',
                bar: {
                    value: 'fubarfubar',
                    date: '2010-05-31T00:00:00.000Z'
                }
            };

            assert(subset(A, B) === true);
        });
    });
});