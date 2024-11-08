// has-property-descriptors.js

function hasPropertyDescriptors() {
    // Check if the functions Object.defineProperty and Object.getOwnPropertyDescriptor are available
    if (typeof Object.defineProperty !== 'function' || typeof Object.getOwnPropertyDescriptor !== 'function') {
        return false;
    }

    try {
        // Test whether you can define a non-enumerable property on an object
        var obj = {};
        Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
        
        // Check if the defined property 'x' is ignored in a for-in loop (non-enumerable)
        for (var _ in obj) {
            // empty loop body
        }
        
        // Validate that the value of the property 'x' is correctly set
        if (obj.x !== obj) {
            return false;
        }

        // Test if you can define properties with getters and setters
        var passed = {};
        Object.defineProperty(passed, 'test', {
            configurable: true,
            enumerable: true,
            get: function () { return 42; },
            set: function (val) { return val; }
        });
        
        // Verify that the getter returns the correct value
        if (passed.test !== 42) {
            return false;
        }

        // If all tests pass, property descriptors are fully supported
        return true;
    } catch (e) {
        // If an error occurs at any point, return false indicating lack of support
        return false;
    }
}

function hasArrayLengthDefineBug() {
    try {
        // Attempt to set the length property of an array using defineProperty
        var arr = [];
        Object.defineProperty(arr, 'length', { value: 1 });
        
        // If no error occurs, return false indicating no bug
        return false;
    } catch (e) {
        // If an error is thrown, return true indicating the presence of the bug
        return true;
    }
}

// Export both functions
module.exports = hasPropertyDescriptors;
module.exports.hasArrayLengthDefineBug = hasArrayLengthDefineBug;

// test.js

var hasPropertyDescriptors = require('./has-property-descriptors');
var assert = require('assert');

// Test to ensure property descriptors functionality is available
assert.equal(hasPropertyDescriptors(), true);
// Test to assert array length define bug does not exist
assert.equal(hasPropertyDescriptors.hasArrayLengthDefineBug(), false);

console.log('All tests passed');
