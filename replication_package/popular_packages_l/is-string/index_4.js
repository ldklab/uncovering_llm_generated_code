// is-string/index.js

'use strict';

/**
 * This function checks if the given value is a string.
 * It uses both `Object.prototype.toString.call(value)` to check for string objects
 * and `typeof value` to check for primitive string types.
 * 
 * @param {any} value - The value to check.
 * @returns {boolean} - Returns true if the value is a string, otherwise false.
 */
function isString(value) {
  return Object.prototype.toString.call(value) === '[object String]' || typeof value === 'string';
}

module.exports = isString;

// is-string/test/test.js

'use strict';

const assert = require('assert');
const isString = require('../index');

/**
 * These assertions test the isString function to ensure it works correctly.
 * It verifies that the function returns false for non-string types and true for strings.
 */
assert.strictEqual(isString(undefined), false, 'Undefined should not be a string');
assert.strictEqual(isString(null), false, 'Null should not be a string');
assert.strictEqual(isString(false), false, 'Boolean should not be a string');
assert.strictEqual(isString(true), false, 'Boolean should not be a string');
assert.strictEqual(isString(() => {}), false, 'Function should not be a string');
assert.strictEqual(isString([]), false, 'Array should not be a string');
assert.strictEqual(isString({}), false, 'Object should not be a string');
assert.strictEqual(isString(/a/g), false, 'Regex should not be a string');
assert.strictEqual(isString(new RegExp('a', 'g')), false, 'Regex object should not be a string');
assert.strictEqual(isString(new Date()), false, 'Date should not be a string');
assert.strictEqual(isString(42), false, 'Number should not be a string');
assert.strictEqual(isString(NaN), false, 'NaN should not be a string');
assert.strictEqual(isString(Infinity), false, 'Infinity should not be a string');
assert.strictEqual(isString(new Number(42)), false, 'Number object should not be a string');

assert.strictEqual(isString('foo'), true, 'String literal should be a string');
assert.strictEqual(isString(Object('foo')), true, 'String object should be a string');

console.log('All tests passed!');

if (require.main === module) {
  console.log('Running tests...');
  require('./test');
}

// is-string/package.json

{
  "name": "is-string",
  "version": "1.0.0",
  "description": "A simple utility for checking if a value is a string",
  "main": "index.js",
  "scripts": {
    "test": "node test/test.js"
  },
  "author": "",
  "license": "ISC"
}
