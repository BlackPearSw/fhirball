var parameters = require('./parameters');

function getCondition(path, condition) {
    var result = {};
    result[path] = condition;
    return result;
}

function getRegexStringSearchMatch(path, value) {
    return [
        {
            type: 'match',
            def: getCondition(parameters.getPathInSearch(path), {$regex: '^' + value.text.toUpperCase()})

        }
    ];
}

function getRegexMatch(path, value) {
    return [
        {
            type: 'match',
            def: getCondition(parameters.getPathInResource(path), {$regex: '^' + value.text})

        }
    ];
}

function getExactMatch(path, value) {
    return [
        {
            type: 'match',
            def: getCondition(parameters.getPathInResource(path), value.text)

        }
    ];
}

function getComplexTypeStringSearchMatch(path, value, index) {
    var op = {
        type: 'match',
        def: {$or: []}
    };
    index.forEach(function (child) {
        op.def.$or.push(getCondition(
            parameters.getPathInSearch(path + child),
            {$regex: '^' + value.text.toUpperCase()})
        );
    });

    return [op];
}

function getComplexTypeExactMatch(path, value, index) {
    var op = {
        type: 'match',
        def: {$or: []}
    };
    index.forEach(function (child) {
        op.def.$or.push(getCondition(parameters.getPathInResource(path + child), value.text));
    });

    return [op];
}

function getCodeableConceptMatch(path, value) {
    var op = {
        type: 'match',
        def: {}
    };

    var dbPathForCode = parameters.getPathInResource(path + '.coding.code');
    op.def[dbPathForCode] = value.text;

    if (value.namespace) {
        var dbPathForNamespace = parameters.getPathInResource(path + '.coding.system');
        op.def[dbPathForNamespace] = value.namespace === NULL_NAMESPACE ? null : value.namespace;
    }

    return [op];

}

function getIdentifierMatch(path, value) {
    var op = {
        type: 'match',
        def: {}
    };

    var dbPathForCode = parameters.getPathInResource(path + '.value');
    op.def[dbPathForCode] = value.text;

    if (value.namespace) {
        var dbPathForNamespace = parameters.getPathInResource(path + '.system');
        op.def[dbPathForNamespace] = value.namespace === NULL_NAMESPACE ? null : value.namespace;
    }

    return [op];

}

function getBooleanMatch(path, value) {
    return [
        {
            type: 'match',
            def: getCondition(parameters.getPathInResource(path), value.text === 'true')
        }
    ];
}


function getDateMatch(path, value) {
    var op = {
        type: 'match',
        def: {}
    };

    if (value.comparator) {
        var inequality = {};
        inequality[value.comparator.db] = value.text;
        op.def[parameters.getPathInResource(path)] = inequality;
    }
    else {
        op.def[parameters.getPathInResource(path)] = {$regex: '^' + value.text};
    }

    return [op];
}

var config = {
    string: {
        string: {
            index: true,
            getMatch: getRegexStringSearchMatch,
            modifier: {
                exact: {
                    getMatch: getExactMatch
                }
            }
        },
        Address: {
            index: ['.line', '.city', '.state', '.zip', '.country'],
            getMatch: function (path, value) {
                return getComplexTypeStringSearchMatch(path, value, config.string.Address.index)
            },
            modifier: {
                exact: {
                    getMatch: function (path, value) {
                        return getComplexTypeExactMatch(path, value, config.string.Address.index);
                    }
                }
            }
        },
        HumanName: {
            index: ['.family', '.given'],
            getMatch: function (path, value) {
                return getComplexTypeStringSearchMatch(path, value, config.string.HumanName.index)
            },
            modifier: {
                exact: {
                    getMatch: function (path, value) {
                        return getComplexTypeExactMatch(path, value, config.string.HumanName.index);
                    }
                }
            }
        }
    },
    token: {
        boolean: {
            index: false, //not worth indexing a boolean!
            getMatch: getBooleanMatch
        },
        CodeableConcept: {
            index: [
                ['.coding.code', '.coding.system']
            ],
            getMatch: getCodeableConceptMatch,
            modifier: {
                text: {
                    index: ['.text'],
                    getMatch: function (path, value) {
                        return getRegexMatch(parameters.getPathInResource(path + '.text'), value);
                    }
                }
            }
        },
        Identifier: {
            index: [
                ['.value', '.system']
            ],
            getMatch: getIdentifierMatch,
            modifier: {
                text: {
                    index: ['.label'],
                    getMatch: function (path, value) {
                        return getRegexMatch(parameters.getPathInResource(path + '.label'), value);
                    }
                }
            }
        }
    },
    date: {
        date: {
            index: true,
            getMatch: getDateMatch
        }
    },
    reference: {
        reference: {
            index: '.reference',
            getMatch: function (path, value) {
                return getExactMatch(parameters.getPathInResource(path + config.reference.reference.index), value);
            }
        }
    }
};

var NULL_NAMESPACE = 'NULL_NAMESPACE';
module.exports = config;