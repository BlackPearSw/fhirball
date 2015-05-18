/*
 * JavaScript Object Query
 *
 * */

var Jsoq = function (obj) {
    if (!obj) {
        throw new Error('obj undefined')
    }

    this.resource = obj;
};

function parse(path) {
    var s = path;
    s = s.replace(/\[(\w+)\]/g, '.$1'); //convert indexes to properties
    s = s.replace(/^\./, ''); //strip leading dot
    return s.split('.');
}

//function get(o, path) {
//    var a = parse(path);
//    while (a.length) {
//        var n = a.shift();
//        if (n in o) {
//            o = o[n];
//        } else {
//            return;
//        }
//    }
//    return o;
//}


function getValuesFromArray(array, propertyName) {
    return [].concat.apply([], array.map(function (item) {
        return item[propertyName]
    }))
    .filter(function (item) {
        return item;
    });
}

function get(o, path) {
    var a = parse(path);
    while (a.length) {
        var n = a.shift();
        if (n in o) {
            o = o[n];
        } else {
            if (Array.isArray(o)) {
                o = getValuesFromArray(o, n);
            }
            else {
                return;
            }
        }
    }
    return o;
}

function put(o, path, value) {
    if (!path) {
        throw new Error('path undefined');
    }
    if (!value) {
        throw new Error('value undefined');
    }

    var a = parse(path);

    while (a.length) {
        var n = a.shift();
        if (n in o) {
            o = o[n];
        } else {
            o[n] = a.length ? {} : value;
            o = o[n];
        }
    }
}

function match(o, path, expected) {
    var actual = get(o, path);
    if (!actual) {
        return false;
    }

    var actual = Array.isArray(actual) ? actual : [actual];

    return actual.reduce(function (prev, actual) {
        for (p in expected) {
            if (expected.hasOwnProperty(p)) {
                if (actual[p] !== expected[p]) {
                    return false;
                }
            }
        }
        return true;
    }, true);
}

function matchRule(o, rule) {
    for (p in rule) {
        if (rule.hasOwnProperty(p)) {
            return match(o, p, rule[p]);
        }
    }
}

Jsoq.prototype = {
    get: function (path) {
        return get(this.resource, path);
    },
    put: function (path, value) {
        put(this.resource, path, value);
    },
    has: function (rule) {
        return matchRule(this.resource, rule);
    }

};

module.exports = function (obj) {
    return new Jsoq(obj);
};