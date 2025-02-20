markdown
# Functionality Explanation:
# The provided code defines a Node.js package that consists of a single function, `isNegativeZero`, which checks if a given value is negative zero (`-0`). The function works by verifying if the value is numerically zero and also whether it results in negative infinity when used as a divisor of positive one. The package includes a test script that asserts various cases to ensure the correctness of the `isNegativeZero` function.

# Rewritten Code:
# Directory: is-negative-zero/

# File: index.js
'use strict';

/**
 * Determines if the specified value is negative zero (-0).
 *
 * @param {*} value - Value to check.
 * @returns {boolean} True if the value is -0, otherwise false.
 */
function isNegativeZero(value) {
    return value === 0 && 1 / value === -Infinity;
}

module.exports = isNegativeZero;

# File: test/test.js
'use strict';

const isNegativeZero = require('../index');
const assert = require('assert');

// Test cases to validate that the implementation correctly identifies negative zero
assert.strictEqual(isNegativeZero(undefined), false);
assert.strictEqual(isNegativeZero(null), false);
assert.strictEqual(isNegativeZero(false), false);
assert.strictEqual(isNegativeZero(true), false);
assert.strictEqual(isNegativeZero(0), false);
assert.strictEqual(isNegativeZero(42), false);
assert.strictEqual(isNegativeZero(Infinity), false);
assert.strictEqual(isNegativeZero(-Infinity), false);
assert.strictEqual(isNegativeZero(NaN), false);
assert.strictEqual(isNegativeZero('foo'), false);
assert.strictEqual(isNegativeZero(() => {}), false);
assert.strictEqual(isNegativeZero([]), false);
assert.strictEqual(isNegativeZero({}), false);
assert.strictEqual(isNegativeZero(-0), true);

console.log('All tests passed!');

# File: package.json
{
  "name": "is-negative-zero",
  "version": "1.0.0",
  "description": "A utility to check if a number is negative zero.",
  "main": "index.js",
  "scripts": {
    "test": "node test/test.js"
  },
  "keywords": [
    "negative-zero",
    "-0",
    "utility"
  ],
  "author": "",
  "license": "MIT"
}

# To test the package:
# 1. Arrange files in the directory as specified above.
# 2. In terminal, navigate to the is-negative-zero directory.
# 3. Optionally run `npm install` if needed for package environment.
# 4. Execute `npm test` to run the tests and ensure functionality.
