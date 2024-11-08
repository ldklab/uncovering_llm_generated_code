// has-property-descriptors.js

/**
 * Checks if the JavaScript environment properly supports property descriptors.
 * This includes the ability to define properties with specific attributes like enumerable,
 * configurable, and getter/setter functions.
 * 
 * @returns {boolean} True if the environment supports property descriptors correctly, false otherwise.
 */
function hasPropertyDescriptors() {
    // Ensure environment has the necessary Object methods for property descriptors
    if (typeof Object.defineProperty !== 'function' || typeof Object.getOwnPropertyDescriptor !== 'function') {
        return false;
    }

    try {
        // Test basic non-enumerable property definition
        var obj = {};
        Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
        for (var _ in obj) { /* empty */ } // Loop to test enumerability
        if (obj.x !== obj) {
            return false;
        }

        // Test property with configurable, enumerable, getter and setter
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
        return false; // If any error occurs, descriptors are not supported correctly
    }
}

/**
 * Checks for a bug where defining the 'length' property of an array throws an error in some environments.
 * 
 * @returns {boolean} True if the bug is present, false otherwise.
 */
function hasArrayLengthDefineBug() {
    try {
        var arr = [];
        Object.defineProperty(arr, 'length', { value: 1 }); // Attempt to define 'length'
        return false; // No error, so no bug present
    } catch (e) {
        return true; // Error occurred, bug is present
    }
}

module.exports = hasPropertyDescriptors;
module.exports.hasArrayLengthDefineBug = hasArrayLengthDefineBug;

// test.js

var hasPropertyDescriptors = require('./has-property-descriptors');
var assert = require('assert');

// Assert that the environment properly supports property descriptors
assert.equal(hasPropertyDescriptors(), true);

// Assert that there is no bug when defining the length of an array
assert.equal(hasPropertyDescriptors.hasArrayLengthDefineBug(), false);

console.log('All tests passed');
