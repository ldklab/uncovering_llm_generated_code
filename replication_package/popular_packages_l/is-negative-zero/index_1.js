markdown
# File: is-negative-zero/index.js
'use strict';

/**
 * Determines if the given value is negative zero.
 *
 * @param {*} value - The value to assess.
 * @returns {boolean} True if the value is -0, otherwise false.
 */
function isNegativeZero(value) {
    // Check if the value is 0 and its reciprocal is -Infinity, which are characteristics of -0
    return value === 0 && 1 / value === -Infinity;
}

module.exports = isNegativeZero;

# File: is-negative-zero/test/test.js
'use strict';

const isNegativeZero = require('../index');
const assert = require('assert');

// Comprehensive test cases for different scenarios
assert.notOk(isNegativeZero(undefined), 'undefined should not be -0');
assert.notOk(isNegativeZero(null), 'null should not be -0');
assert.notOk(isNegativeZero(false), 'false should not be -0');
assert.notOk(isNegativeZero(true), 'true should not be -0');
assert.notOk(isNegativeZero(0), 'positive 0 should not be -0');
assert.notOk(isNegativeZero(42), 'number 42 should not be -0');
assert.notOk(isNegativeZero(Infinity), 'Infinity should not be -0');
assert.notOk(isNegativeZero(-Infinity), '-Infinity should not be -0');
assert.notOk(isNegativeZero(NaN), 'NaN should not be -0');
assert.notOk(isNegativeZero('foo'), 'string "foo" should not be -0');
assert.notOk(isNegativeZero(() => {}), 'function should not be -0');
assert.notOk(isNegativeZero([]), 'empty array should not be -0');
assert.notOk(isNegativeZero({}), 'empty object should not be -0');
assert.ok(isNegativeZero(-0), '-0 should be recognized as -0');

console.log('All tests passed!');

# File: is-negative-zero/package.json
{
  "name": "is-negative-zero",
  "version": "1.0.0",
  "description": "Check if a number is negative zero.",
  "main": "index.js",
  "scripts": {
    "test": "node test/test.js"
  },
  "keywords": [
    "negative",
    "zero",
    "-0"
  ],
  "author": "",
  "license": "MIT"
}

# Instructions for testing
# 1. Arrange your files as follows:
#    is-negative-zero/
#        ├── index.js
#        ├── test/
#        │   └── test.js
#        └── package.json
#
# 2. Open your terminal and navigate to the `is-negative-zero` directory.
#
# 3. Optionally run `npm install` if you need any dependencies (not required here).
#
# 4. Execute the tests by running `npm test`.
