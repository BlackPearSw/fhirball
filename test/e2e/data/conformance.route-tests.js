exports.resources_path = __dirname + '/resources';
exports.route = '/fhir/';
exports.conformance = {
    resourceType: 'Conformance',
    rest: [
        {
            mode: 'server',
            resource: [
                {
                    type: 'AdverseReaction',
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
                    readHistory: true
                },
                {
                    type: 'Alert',
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
                    searchParam: [
                    ]
                },
                {
                    type: 'AllergyIntolerance',
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
                    searchParam: [
                    ]
                },
                {
                    type: 'Appointment',
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
                    searchParam: [
                    ]
                },
                {
                    type: 'AppointmentResponse',
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
                    searchParam: [
                    ]
                },
                {
                    type: 'Availability',
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
                    ]
                },
                {
                    type: 'CarePlan',
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
                    ]
                },
                {
                    type: 'ConceptMap',
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
                    ]
                },
                {
                    type: 'Condition',
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
                    ]
                },
                {
                    type: 'Conformance',
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
                    ]
                },
                {
                    type: 'Device',
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
                    ]
                },
                {
                    type: 'DiagnosticOrder',
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
                    ]
                },
                {
                    type: 'Document',
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
                    ]
                },
                {
                    type: 'DocumentManifest',
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
                    ]
                },
                {
                    type: 'DocumentReference',
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
                    ]
                },
                {
                    type: 'Encounter',
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
                    ]
                },
                {
                    type: 'FamilyHistory',
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
                    ]
                },
                {
                    type: 'ImagingStudy',
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
                    ]
                },
                {
                    type: 'Immunization',
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
                    ]
                },
                {
                    type: 'ImmunizationRecommendation',
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
                    ]
                },
                {
                    type: 'List',
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
                    ]
                },
                {
                    type: 'Media',
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
                    ]
                },
                {
                    type: 'Medication',
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
                    ]
                },
                {
                    type: 'MedicationAdministration',
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
                    ]
                },
                {
                    type: 'MedicationPrescription',
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
                    ]
                },
                {
                    type: 'MedicationStatement',
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
                    ]
                },
                {
                    type: 'MessageHeader',
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
                    ]
                },
                {
                    type: 'Namespace',
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
                    ]
                },
                {
                    type: 'Observation',
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
                    ]
                },
                {
                    type: 'OperationOutcome',
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
                    ]
                },
                {
                    type: 'Order',
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
                    ]
                },
                {
                    type: 'OrderResponse',
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
                    ]
                },
                {
                    type: 'Organization',
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
                    ]
                },
                {
                    type: 'Other',
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
                    ]
                },
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
                    ]
                },
                {
                    type: 'Practitioner',
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
                    ]
                },
                {
                    type: 'Procedure',
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
                    ]
                },
                {
                    type: 'Provenance',
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
                    ]
                },
                {
                    type: 'Query',
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
                    ]
                },
                {
                    type: 'Questionnaire',
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
                    ]
                },
                {
                    type: 'RelatedPerson',
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
                    ]
                },
                {
                    type: 'SecurityEvent',
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
                    ]
                },
                {
                    type: 'Slot',
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
                    ]
                },
                {
                    type: 'Specimen',
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
                    ]
                },
                {
                    type: 'Substance',
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
                    ]
                },
                {
                    type: 'Supply',
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
                    ]
                }
            ]
        }
    ]
};