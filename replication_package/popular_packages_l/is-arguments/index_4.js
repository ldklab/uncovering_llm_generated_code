// is-arguments.js

'use strict';

module.exports = function isArguments(value) {
    // Identifies if a given value is an 'arguments' object
    return Object.prototype.toString.call(value) === '[object Arguments]';
};

// test.js

'use strict';

var isArguments = require('./is-arguments');
var assert = require('assert');

// Test cases for the isArguments function
assert.strictEqual(isArguments({}), false, 'Expected false for empty object');  // Test with an object
assert.strictEqual(isArguments([]), false, 'Expected false for empty array');   // Test with an array

// Test with an actual arguments object
(function () {
    assert.strictEqual(isArguments(arguments), true, 'Expected true for arguments object');
}());

// Run tests directly and print a message if tests pass
if (require.main === module) {
    console.log('All tests passed.');
}
