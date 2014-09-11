var RouteFactory = require('../../lib/RouteFactory/index');

var settings = require('../settings');
var expect = require('expect.js');

describe('RouteFactory', function () {
    it('should be constructed without options', function () {
        var factory = new RouteFactory();

        expect(factory).to.be.ok();
    });

    describe('make', function () {
        var factory = new RouteFactory();

        //TODO

        before(function (done) {
            done();
            /*var profile = settings.profiles_path + '/patient.profile.xml';
            var factory = new SchemaFactory();
            factory.make(profile)
                .then(function (data) {
                    schema = data;
                })
                .done(done);       */
        });
    });
});