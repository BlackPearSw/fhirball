var mongoose = require('mongoose');
var express = require('express');

var Router = require('../lib/Router/index');
var settings = require('./settings');

//connect fhirgoose to mongodb
mongoose.connect('mongodb://localhost/test-fhirball');

//create app using fhir router to provide rest api
var app = express();
app.use('/', Router(settings.conformance, settings.profiles_path));

//start the app
app.listen(1337);
console.log('listening for requests on port 1337');
