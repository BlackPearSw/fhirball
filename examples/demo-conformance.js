module.exports = {
    resourceType: 'Conformance',
    publisher: 'Black Pear Software',
    date: new Date(),
    software: {
        name: 'fhirball',
        version: '0.0.1'
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