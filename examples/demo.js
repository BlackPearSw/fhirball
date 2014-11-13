var express = require('express');
var fhirball = require('../lib/index');
var conformance = require('./demo-conformance');

var options = {
    db: 'mongodb://localhost/fhirball-demo',
    conformance: conformance,
    'content-type': 'application/json'
};

//create app using fhirball router to provide fhir rest api
var app = express();
app.use('/fhir/', new fhirball.Router(options));

//start the app
app.listen(1337);
console.log('listening for requests on port 1337');
