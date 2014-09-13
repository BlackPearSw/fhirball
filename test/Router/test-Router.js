var Router = require('../../lib/Router/index');
var mongoose = require('mongoose');

var settings = require('../settings');
var expect = require('expect.js');

describe('Router', function(){
    it('should be constructed with options', function () {
        var router = new Router(settings.conformance, settings.PROFILES_PATH, mongoose);

        expect(router).to.be.ok();
        expect(mongoose.fhir).to.be.ok();
    });
});