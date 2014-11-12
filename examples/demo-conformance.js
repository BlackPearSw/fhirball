module.exports = {
    resourceType: 'Conformance',
    rest: [
        {
            mode: 'server',
            resource: [
                {
                    type: 'Patient',
                    profile: {
                        reference: ''
                    },
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
                        {
                            name: 'name',
                            type: 'string',
                            documentation: 'A portion of the family name of the patient',
                            path: ['Patient.name.family', 'Patient.name.given']
                        },
                        {
                            name: 'family',
                            type: 'string',
                            documentation: 'A portion of the family name of the patient',
                            path: ['Patient.name.family']
                        },
                        {
                            name: 'given',
                            type: 'string',
                            documentation: 'A portion of the given name of the patient',
                            path: ['Patient.name.given']
                        },
                        {
                            name: 'identifier',
                            type: 'token',
                            documentation: 'A patient identifier',
                            path: ['Patient.identifier.value']
                        },
                        {
                            name: 'gender',
                            type: 'token',
                            documentation: 'Gender of the patient',
                            path: ['Patient.gender.code']
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
                    readHistory: false,
                    updateCreate: false,
                    searchParam: [
                    ]
                }
            ]
        }
    ]
};