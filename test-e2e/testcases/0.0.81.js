exports.profiles_path = __dirname + '/../profiles/0.0.81';
exports.resources_path = __dirname + '/../resources/0.0.81';
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