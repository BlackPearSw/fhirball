exports.resources_path = __dirname + '/../0.0.81/resources';
exports.route = '/0.0.81/';
exports.conformance = {
    resourceType: 'Conformance',
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
                    readHistory: false,
                    updateCreate: false,
                    searchParam: [
                    ]
                }
            ]
        }
    ]
};