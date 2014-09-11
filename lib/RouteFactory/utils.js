var mongoose = require('mongoose');

exports.isSubset = function (A, B) {
    var logFailure = true;
    function failed(x, y) {
        if (logFailure) {
            console.log('** X **');
            console.log(JSON.stringify(x));
            console.log('** Y **');
            console.log(JSON.stringify(y));
        }
    }

    function compare2Objects(x, y) {
        var p;

        // remember that NaN === NaN returns false
        // and isNaN(undefined) returns true
        if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
            return true;
        }

        // Compare primitives and functions.
        // Check if both arguments link to the same object.
        // Especially useful on step when comparing prototypes
        if (x === y) {
            return true;
        }

        // Works in case when functions are created in constructor.
        if ((typeof x === 'function' && typeof y === 'function') ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number)) {
            return x.toString() === y.toString();
        }

        // At last checking prototypes as good a we can
        if (!(x instanceof Object && y instanceof Object)) {
            failed(x, y);
            return false;
        }

        if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
            failed(x, y);
            return false;
        }

        if (x.constructor !== y.constructor) {
            failed(x, y);
            return false;
        }

        if (x.prototype !== y.prototype) {
            failed(x, y);
            return false;
        }

        // check for infinitive linking loops
        if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
            failed(x, y);
            return false;
        }

        /*
         //Only looking for subset of properties
         for (p in y) {
         if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
         return false;
         }
         else if (typeof y[p] !== typeof x[p]) {
         return false;
         }
         } */

        for (p in x) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                failed(x, y);
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                //loose match for dates
                if (y[p] instanceof Date || x[p] instanceof Date) {
                    y[p] = new Date(y[p]);
                    x[p] = new Date(x[p]);
                }
                //loose match for objectId
                else if (y[p] instanceof mongoose.Types.ObjectId || x[p] instanceof mongoose.Types.ObjectId) {
                    y[p] = y[p].toString();
                    x[p] = x[p].toString();
                }
                else {
                    failed(x, y);
                    return false;
                }
            }

            switch (typeof (x[p])) {
                case 'object':
                case 'function':

                    leftChain.push(x);
                    rightChain.push(y);

                    if (!compare2Objects(x[p], y[p])) {
                        return false;
                    }

                    leftChain.pop();
                    rightChain.pop();
                    break;

                default:
                    if (x[p] !== y[p]) {
                        failed(x, y);
                        return false;
                    }
                    break;
            }
        }

        return true;
    }

    if (arguments.length < 1) {
        return true; //Die silently? Don't know how to handle such case, please help...
        // throw "Need two or more arguments to compare";
    }

    for (i = 1, l = arguments.length; i < l; i++) {

        leftChain = []; //todo: this can be cached
        rightChain = [];

        if (!compare2Objects(arguments[0], arguments[i])) {
            if(logFailure) {
                console.log('******************');
                console.log(arguments[0]);
            }
            return false;
        }
    }

    return true;
};

exports.createBuffer = function (len) {
    var buffer = new Buffer(len);
    buffer.fill(0x00);
    return buffer;
};
