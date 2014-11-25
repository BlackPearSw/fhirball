module.exports = {
    resourceType: 'Conformance',
    publisher: 'Black Pear Software',
    date: new Date(),
    software: {
        name: 'fhirball',
        version: '0.0.4'
    },
    implementation: {
        description: 'Demo Master Patient Index service using fhirball',
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
                                path: 'Patient.address',
                                contentType: 'Address',
                                index: true
                            }
                        },
                        {
                            name: 'animal-breed',
                            type: 'token',
                            documentation: 'The breed for animal patients',
                            document: {
                                path: 'Patient.animal.breed',
                                contentType: 'CodeableConcept',
                                index: true
                            }
                        },
                        {
                            name: 'birthdate',
                            type: 'date',
                            documentation: 'The patient\'s date of birth',
                            document: {
                                path: 'Patient.birthDate',
                                contentType: 'date',
                                index: true
                            }
                        },
                        {
                            name: 'name',
                            type: 'string',
                            documentation: 'A portion of the family name of the patient. Case-sensitive.',
                            document: {
                                path: 'Patient.name',
                                contentType: 'HumanName',
                                index: true
                            }
                        },
                        {
                            name: 'family',
                            type: 'string',
                            documentation: 'A portion of the family name of the patient. Case-sensitive.',
                            document: {
                                path: 'Patient.name.family',
                                contentType: 'string'
                                //search will use name index
                            }
                        },
                        {
                            name: 'given',
                            type: 'string',
                            documentation: 'A portion of the given name of the patient. Case-sensitive.',
                            document: {
                                path: 'Patient.name.given',
                                contentType: 'string',
                                index: true
                            }
                        },
                        {
                            name: 'identifier',
                            type: 'token',
                            documentation: 'A patient identifier',
                            document: {
                                path: 'Patient.identifier',
                                contentType: 'Identifier',
                                index: true
                            }
                        },
                        {
                            name: 'gender',
                            type: 'token',
                            documentation: 'Gender of the patient',
                            //TODO: document should be an extension, but what does it look like?
                            extension : [
                                //plan A
                                {
                                    url : 'http://fhirball.com/fhir/Conformance#search',
                                    extension : [
                                        {
                                            url : 'http://fhirball.com/fhir/Conformance#search-index',
                                            valueBoolean : false //index low specificity
                                        },
                                        {
                                            url : 'http://fhirball.com/fhir/Conformance#search-path',
                                            //TODO: how do we represent an array of values?
                                            valuePath : ['Patient.gender.coding.code']
                                        }
                                    ]
                                },
                                //plan B
                                {
                                    url : 'http://fhirball.com/fhir/Conformance#search',
                                    valueString: '{path: ["Patient.gender.coding.code"], index: false}'
                                }
                            ],
                            document: {
                                path: 'Patient.gender',
                                contentType: 'CodeableConcept'
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