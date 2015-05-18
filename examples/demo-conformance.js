module.exports = {
    resourceType: 'Conformance',
    publisher: 'Black Pear Software',
    date: new Date(),
    software: {
        name: 'fhirball',
        version: '0.0.7'
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
                        {code: 'vread'},
                        {code: 'update'},
                        {code: 'delete'},
                        {code: 'history-instance'},
                        {code: 'create'},
                        {code: 'history-type'},
                        {code: 'search-type'}
                    ],
                    readHistory: true,
                    updateCreate: false,
                    searchParam: [
                        {
                            name: 'address',
                            type: 'string',
                            documentation: 'An address in any kind of address/part of the patient. Case-sensitive.',
                            extension: [
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-path',
                                    valueString: 'Patient.address'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-contentType',
                                    valueString: 'Address'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-index',
                                    valueBoolean: true
                                }
                            ]
                        },
                        {
                            name: 'animal-breed',
                            type: 'token',
                            documentation: 'The breed for animal patients',
                            extension: [
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-path',
                                    valueString: 'Patient.animal.breed'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-contentType',
                                    valueString: 'CodeableConcept'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-index',
                                    valueBoolean: true
                                }
                            ]
                        },
                        {
                            name: 'birthdate',
                            type: 'date',
                            documentation: 'The patient\'s date of birth',
                            extension: [
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-path',
                                    valueString: 'Patient.birthDate'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-contentType',
                                    valueString: 'date'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-index',
                                    valueBoolean: true
                                }
                            ]
                        },
                        {
                            name: 'name',
                            type: 'string',
                            documentation: 'A portion of the family name of the patient',
                            extension: [
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-path',
                                    valueString: 'Patient.name'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-contentType',
                                    valueString: 'HumanName'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-index',
                                    valueBoolean: true
                                }
                            ]
                        },
                        {
                            name: 'family',
                            type: 'string',
                            documentation: 'A portion of the family name of the patient',
                            extension: [
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-path',
                                    valueString: 'Patient.name.family'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-contentType',
                                    valueString: 'string'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-index',
                                    valueBoolean: true
                                }
                            ]
                        },
                        {
                            name: 'given',
                            type: 'string',
                            documentation: 'A portion of the given name of the patient',
                            extension: [
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-path',
                                    valueString: 'Patient.name.given'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-contentType',
                                    valueString: 'string'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-index',
                                    valueBoolean: true
                                }
                            ]
                        },
                        {
                            name: 'identifier',
                            type: 'token',
                            documentation: 'A patient identifier',
                            extension: [
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-path',
                                    valueString: 'Patient.identifier'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-contentType',
                                    valueString: 'Identifier'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-index',
                                    valueBoolean: true
                                }
                            ]
                        },
                        {
                            name: 'gender',
                            type: 'token',
                            documentation: 'Gender of the patient',
                            extension : [
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-path',
                                    valueString: 'Patient.gender'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-contentType',
                                    valueString: 'CodeableConcept'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-index',
                                    valueBoolean: false //index low specificity
                                }
                            ]
                        },
                        {
                            name: 'provider',
                            type: 'reference',
                            target: ['Organization'],
                            documentation: 'Reference to the responsible organisation',
                            extension : [
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-path',
                                    valueString: 'Patient.managingOrganization'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-contentType',
                                    valueString: 'reference'
                                },
                                {
                                    url: 'http://fhirball.com/fhir/Conformance#search-index',
                                    valueBoolean: true
                                }
                            ]
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