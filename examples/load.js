var conformance = require('./demo-conformance');
var fs = require('fs');
var resources_path = __dirname + '/../test/e2e/data/resources';
var request = require('request');

conformance.rest[0].resource.forEach(function (resource) {
    var path = resources_path + '/wellformed/' + resource.type;
    if (fs.existsSync(path)) {
        fs.readdirSync(path)
            .forEach(function (file) {
                var input = JSON.parse(fs.readFileSync(path + '/' + file, 'utf-8'));
                console.log(file);

                var uri = 'http://localhost:1337/fhir/' + resource.type;

                request({
                    uri: uri,
                    method: "POST",
                    json: input
                }, function(error, response, body) {
                    if (error) console.log(error);
                    if (body) console.log(body);
                });
            });
    }
});