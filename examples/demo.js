var express = require('express');
var mongoose = require('mongoose');
var fhirball = require('../lib/index');

var profiles_path = __dirname + '/../test/profiles';
var conformance = {
    rest: [
        {
            mode: 'server',
            resource: [
                {
                    type: 'Foo',
                    operation: [
                        {code: 'read'},
                        {code: 'update'},
                        {code: 'delete'},
                        {code: 'create'},
                        {code: 'search-type'}
                    ],
                    readHistory: false,
                    updateCreate: false,
                    searchParam: [
                    ]
                },
                {
                    type: 'Bar',
                    operation: [
                        {code: 'read'},
                        {code: 'create'},
                        {code: 'search-type'}
                    ],
                    readHistory: false,
                    updateCreate: false,
                    searchParam: [
                    ]
                }
            ]
        }
    ]
};

//connect fhirgoose to mongodb
mongoose.connect('mongodb://localhost/fhirball-demo');

//create app using fhirball router to provide fhir rest api
var app = express();
app.use('/fhir/', fhirball.Router(conformance, profiles_path));

//start the app
app.listen(1337);
console.log('listening for requests on port 1337');
