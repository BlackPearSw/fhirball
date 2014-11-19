![fhirball](./res/branding/fhirball@2x-76@2x.png)

fhirball
========
An Express router for persisting [HL7 FHIR](http://www.hl7.org/implement/standards/fhir/) resources in MongoDB. 
Provides a RESTful API that partially implements the FHIR DSTU 1 proposal.
Service configuration is defined using a Conformance resource. 
The server performs only trivial validation - if you post well-formed resources then you can read well-formed resources!

Prerequisites
-------------
Node.js 10+, MongoDB 2.6+

Use
---
To install fhirball:

    $ npm install fhirball
    $ npm install express

To use fhirball create a javascript file and reference express and fhirball packages:

    var express = require('express');
    var fhirball = require('fhirball');

Declare the conformance statement for the server. The conformance statement is parsed on startup and used to generate 
resource interactions and searches. SearchParams have been extended with a non-standard field (document) defining
the document paths to be searched and whether an index should be created to support the search. For example, to create
a Master Patient Index with basic audit capability:

    var conformance = {
        resourceType: 'Conformance',
        publisher: 'Fhirball',
        date: new Date(),
        software: {
            name: 'fhirball',
            version: '0.0.2'
        },
        implementation: {
            description: 'Master Patient Index service',
            url: 'http://127.0.0.1:1337/fhir/'
        },
        fhirVersion: '0.0.82',
        rest: [
            {
                mode: 'server',
                resource: [
                    {
                        type: 'Patient',
                        operation: [
                            {code: 'read'},
                            {code: 'update'},
                            {code: 'delete'},
                            {code: 'create'},
                            {code: 'search-type'}
                        ],
                        searchParam: [
                            {
                                name: 'address',
                                type: 'string',
                                documentation: 'An address in any kind of address/part of the patient. Case-sensitive.',
                                document: {
                                    path: ['Patient.address.text', 'Patient.address.line', 'Patient.address.city', 'Patient.address.state', 'Patient.address.zip', 'Patient.address.country'],
                                    index: true
                                }
                            },
                            {
                                name: 'animal-breed',
                                type: 'token',
                                documentation: 'The breed for animal patients',
                                document: {
                                    path: ['Patient.animal.breed.coding.code'],
                                    index: true
                                }
                            },
                            {
                                name: 'name',
                                type: 'string',
                                documentation: 'A portion of the family name of the patient. Case-sensitive.',
                                document: {
                                    path: ['Patient.name.family', 'Patient.name.given'],
                                    index: true
                                }
                            },
                            {
                                name: 'family',
                                type: 'string',
                                documentation: 'A portion of the family name of the patient. Case-sensitive.',
                                document: {
                                    path: ['Patient.name.family']
                                    //search will use name index
                                }
                            },
                            {
                                name: 'given',
                                type: 'string',
                                documentation: 'A portion of the given name of the patient. Case-sensitive.',
                                document: {
                                    path: ['Patient.name.given'],
                                    index: true
                                }
                            },
                            {
                                name: 'identifier',
                                type: 'token',
                                documentation: 'A patient identifier',
                                document: {
                                    path: ['Patient.identifier.value'],
                                    index: true
                                }
                            },
                            {
                                name: 'gender',
                                type: 'token',
                                documentation: 'Gender of the patient',
                                document: {
                                    path: ['Patient.gender.code']
                                    //index low specificity
                                }
                            }
                        ]
                    },
                    {
                        type: 'SecurityEvent',
                        operation: [
                            {code: 'read'},
                            {code: 'create'},
                            {code: 'search-type'}
                        ],
                        searchParam: [
                        ]
                    }
                ]

            }
        ]
    };

Declare fhirball options, a mongodb connection string, the conformance statement and the content-type (currently must
be application/json)

    var options = {
        db: 'mongodb://localhost/fhirball-demo',
        conformance: conformance,
        'content-type': 'application/json'
    };

Create and start app using fhirball router to provide FHIR api:
    
    var app = express();
    app.use('/fhir/', new fhirball.Router(options));

    //start the app
    app.listen(1337);
    console.log(conformance.implementation.description,'listening for requests on port 1337');

Test
----
To execute unit tests:

    npm install
    mocha --recursive ./test/spec

To execute integration tests, performing CRUD operations on each sample resource:

    mocha --recursive ./test/e2e

Integration tests assume a mongod instance running on localhost.

Copyright
---------
Copyright 2014 Black Pear Software Ltd.

This material contains content from HL7. Unless otherwise noted in the filename, sample FHIR resources in 
test/e2e/data are © HL7.org 2011+ and used under license (http://www.hl7.org/implement/standards/fhir/license.html)

License
-------
fhirball is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

fhirball is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

Acknowledgements
----------------
Supported by [Black Pear Software](www.blackpear.com)
 
Additional contributions from [freshEHR](http://freshehr.com/)

![HL7 FHIR](./res/branding/fhir-logo-www.png)
![Powered by MongoDB](./res/branding/mongodb-powered-by-badge-white.jpg)



