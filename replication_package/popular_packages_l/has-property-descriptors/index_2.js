// has-property-descriptors.js

/**
 * This function checks if the JavaScript environment supports property descriptors.
 */
function hasPropertyDescriptors() {
    // Check if the required methods for property descriptors are available
    if (typeof Object.defineProperty !== 'function' || typeof Object.getOwnPropertyDescriptor !== 'function') {
        return false;
    }

    try {
        // Test basic capability to define a property with property descriptors
        var obj = {};
        Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
        for (var _ in obj) { /* empty */ } // eslint-disable-line no-unused-vars
        if (obj.x !== obj) {
            return false;
        }

        // Test getter and setter functionality
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

/**
 * This function checks if there is a bug when trying to define an array's length.
 */
function hasArrayLengthDefineBug() {
    try {
        // Attempt to redefine the length of the array
        var arr = [];
        Object.defineProperty(arr, 'length', { value: 1 });
        return false; // No exception means no bug
    } catch (e) {
        return true; // Exception means there is a bug
    }
}

// Export the functions for other modules to use
module.exports = hasPropertyDescriptors;
module.exports.hasArrayLengthDefineBug = hasArrayLengthDefineBug;

// test.js

// Import the functionality we want to test
var hasPropertyDescriptors = require('./has-property-descriptors');
var assert = require('assert');

// Assert that the environment correctly supports property descriptors
assert.equal(hasPropertyDescriptors(), true); // Check property descriptor support

// Assert that the environment does not have the array length define bug
assert.equal(hasPropertyDescriptors.hasArrayLengthDefineBug(), false); // Check array length define bug

console.log('All tests passed');
