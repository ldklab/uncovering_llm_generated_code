// has-property-descriptors.js

function hasPropertyDescriptors() {
    // Check if Object.defineProperty and Object.getOwnPropertyDescriptor functions are available
    if (typeof Object.defineProperty !== 'function' || typeof Object.getOwnPropertyDescriptor !== 'function') {
        return false;
    }

    try {
        // Test property descriptors on a plain object
        var obj = {};
        Object.defineProperty(obj, 'x', { enumerable: false, value: obj });

        // Check if the defined property behaves as expected
        for (var _ in obj) { /* empty */ } // eslint-disable-line no-unused-vars
        if (obj.x !== obj) {
            return false;
        }

        var passed = {};
        // Define a property with getters and setters
        Object.defineProperty(passed, 'test', {
            configurable: true,
            enumerable: true,
            get: function () { return 42; },
            set: function (val) { return val; }
        });

        // Verify the getter returns the correct value
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
        // Attempt to set a fixed length on an array
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

// Tests whether environment supports property descriptors
assert.equal(hasPropertyDescriptors(), true);

// Tests whether there is a bug defining array length with Object.defineProperty
assert.equal(hasPropertyDescriptors.hasArrayLengthDefineBug(), false);

console.log('All tests passed');
