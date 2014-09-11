var Router = require('../../lib/Router/index');

var settings = require('../settings');
var expect = require('expect.js');

describe('Router', function(){
    it('should be constructed without options', function () {
        var router = new Router(settings.conformance, settings.PROFILES_PATH);

        expect(router).to.be.ok();
    });
});