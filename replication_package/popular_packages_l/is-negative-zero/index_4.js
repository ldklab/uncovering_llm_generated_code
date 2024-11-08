// File: is-negative-zero/index.js
'use strict';

/**
 * Checks if the provided value is negative zero.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} Returns true if the value is -0, otherwise false.
 */
function isNegativeZero(value) {
    return value === 0 && 1 / value === -Infinity; // Determine if the value is -0 by checking if dividing 1 by the value results in -Infinity
}

module.exports = isNegativeZero; // Export the function for use in other files

// File: is-negative-zero/test/test.js
'use strict';

var isNegativeZero = require('../index'); // Import the isNegativeZero function
var assert = require('assert'); // Import Node.js assert module for test validations

// Test cases to verify the functionality of the isNegativeZero function
assert.notOk(isNegativeZero(undefined)); // Should return false
assert.notOk(isNegativeZero(null)); // Should return false
assert.notOk(isNegativeZero(false)); // Should return false
assert.notOk(isNegativeZero(true)); // Should return false
assert.notOk(isNegativeZero(0)); // Should return false, as 0 is not -0
assert.notOk(isNegativeZero(42)); // Should return false
assert.notOk(isNegativeZero(Infinity)); // Should return false
assert.notOk(isNegativeZero(-Infinity)); // Should return false
assert.notOk(isNegativeZero(NaN)); // Should return false
assert.notOk(isNegativeZero('foo')); // Should return false
assert.notOk(isNegativeZero(function () {})); // Should return false
assert.notOk(isNegativeZero([])); // Should return false
assert.notOk(isNegativeZero({})); // Should return false
assert.ok(isNegativeZero(-0)); // Should return true, as -0 is indeed -0

console.log('All tests passed!'); // Inform the user that all tests have been successful

// File: is-negative-zero/package.json
{
  "name": "is-negative-zero",
  "version": "1.0.0",
  "description": "Check if a number is negative zero.",
  "main": "index.js",
  "scripts": {
    "test": "node test/test.js" // Script to run the tests
  },
  "keywords": [
    "negative",
    "zero",
    "-0"
  ],
  "author": "",
  "license": "MIT"
}

/**
 * Instructions for testing:
 * 1. Save the code into a directory structure like this:
 *    is-negative-zero/
 *        ├── index.js
 *        ├── test/
 *        │   └── test.js
 *        └── package.json
 *
 * 2. Navigate to the is-negative-zero directory in the terminal.
 *
 * 3. Run `npm install` to set up the package, if necessary.
 *
 * 4. Run `npm test` to execute the test script.
 */
