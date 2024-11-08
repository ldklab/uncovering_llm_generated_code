// File: is-negative-zero/index.js
'use strict';

/**
 * Determines if the given value is negative zero.
 *
 * @param {*} value - The value to examine.
 * @returns {boolean} True if the value is -0, false otherwise.
 */
function isNegativeZero(value) {
    return value === 0 && 1 / value === -Infinity;
}

module.exports = isNegativeZero;

// File: is-negative-zero/test/test.js
'use strict';

const isNegativeZero = require('../index');
const assert = require('assert');

// Testing various cases for negative zero detection
assert.notOk(isNegativeZero(undefined), 'undefined should not be -0');
assert.notOk(isNegativeZero(null), 'null should not be -0');
assert.notOk(isNegativeZero(false), 'false should not be -0');
assert.notOk(isNegativeZero(true), 'true should not be -0');
assert.notOk(isNegativeZero(0), '0 should not be -0');
assert.notOk(isNegativeZero(42), '42 should not be -0');
assert.notOk(isNegativeZero(Infinity), 'Infinity should not be -0');
assert.notOk(isNegativeZero(-Infinity), '-Infinity should not be -0');
assert.notOk(isNegativeZero(NaN), 'NaN should not be -0');
assert.notOk(isNegativeZero('foo'), '"foo" should not be -0');
assert.notOk(isNegativeZero(() => {}), 'function should not be -0');
assert.notOk(isNegativeZero([]), 'empty array should not be -0');
assert.notOk(isNegativeZero({}), 'object should not be -0');
assert.ok(isNegativeZero(-0), '-0 should be recognized as -0');

console.log('All tests passed!');

// File: is-negative-zero/package.json
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

// Instructions for testing
// 1. Set up the directory structure like so:
//    is-negative-zero/
//        ├── index.js
//        ├── test/
//        │   └── test.js
//        └── package.json
//
// 2. Open a terminal and navigate to the is-negative-zero folder.
//
// 3. If needed, run `npm install` to install dependencies.
//
// 4. Run `npm test` to start the test suite.
