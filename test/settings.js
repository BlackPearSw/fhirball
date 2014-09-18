exports.profiles_path = __dirname + '/input/profiles';
exports.valuesets_path = __dirname + '/input/valuesets';
exports.TEST_PROFILE_PATH = __dirname + '/input/profiles/foo.profile.xml';
exports.conformance = {
    rest: [
        {
            mode: 'server',
            resource: [
                {
                    type: 'Bar',
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