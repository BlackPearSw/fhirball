exports.PROFILES_PATH = __dirname + '/profiles';
exports.conformance = {
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