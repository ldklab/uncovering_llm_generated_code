markdown
# File: is-negative-zero/index.js
'use strict';

/**
 * Checks if the provided value is negative zero.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} Returns true if the value is -0, otherwise false.
 */
function isNegativeZero(value) {
    return value === 0 && 1 / value === -Infinity;
}

module.exports = isNegativeZero;

# File: is-negative-zero/test/test.js
'use strict';

var isNegativeZero = require('../index');
var assert = require('assert');

// Test cases
assert.notOk(isNegativeZero(undefined));
assert.notOk(isNegativeZero(null));
assert.notOk(isNegativeZero(false));
assert.notOk(isNegativeZero(true));
assert.notOk(isNegativeZero(0));
assert.notOk(isNegativeZero(42));
assert.notOk(isNegativeZero(Infinity));
assert.notOk(isNegativeZero(-Infinity));
assert.notOk(isNegativeZero(NaN));
assert.notOk(isNegativeZero('foo'));
assert.notOk(isNegativeZero(function () {}));
assert.notOk(isNegativeZero([]));
assert.notOk(isNegativeZero({}));
assert.ok(isNegativeZero(-0));

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
# 1. Save the code into a directory structure like this:
#    is-negative-zero/
#        ├── index.js
#        ├── test/
#        │   └── test.js
#        └── package.json
#
# 2. Navigate to the is-negative-zero directory in the terminal.
#
# 3. Run `npm install` to set up the package, if necessary.
#
# 4. Run `npm test` to execute the test script.
