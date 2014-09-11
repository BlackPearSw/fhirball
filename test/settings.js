//console.log(__dirname + '/profiles/foo.profile.xml');

exports.PROFILES_PATH = __dirname + '/profiles';
exports.TEST_PROFILE_PATH = __dirname + '/profiles/foo.profile.xml';
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