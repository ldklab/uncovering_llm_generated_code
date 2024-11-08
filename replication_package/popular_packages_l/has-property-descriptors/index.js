// has-property-descriptors.js

function hasPropertyDescriptors() {
    if (typeof Object.defineProperty !== 'function' || typeof Object.getOwnPropertyDescriptor !== 'function') {
        return false;
    }

    try {
        var obj = {};
        Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
        for (var _ in obj) { /* empty */ } // eslint-disable-line no-unused-vars
        if (obj.x !== obj) {
            return false;
        }

        var passed = {};
        Object.defineProperty(passed, 'test', {
            configurable: true,
            enumerable: true,
            get: function () { return 42; },
            set: function (val) { return val; }
        });
        
        if (passed.test !== 42) {
            return false;
        }

        return true;
    } catch (e) {
        return false;
    }
}

function hasArrayLengthDefineBug() {
    try {
        var arr = [];
        Object.defineProperty(arr, 'length', { value: 1 });
        return false;
    } catch (e) {
        return true;
    }
}

module.exports = hasPropertyDescriptors;
module.exports.hasArrayLengthDefineBug = hasArrayLengthDefineBug;

// test.js

var hasPropertyDescriptors = require('./has-property-descriptors');
var assert = require('assert');

assert.equal(hasPropertyDescriptors(), true); // Check property descriptor support
assert.equal(hasPropertyDescriptors.hasArrayLengthDefineBug(), false); // Check array length define bug

console.log('All tests passed');
