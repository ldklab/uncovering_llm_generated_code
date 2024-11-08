// src/isString.js

'use strict';

// Function to determine if the passed value is a string
function isString(value) {
  // Check if value is of type string in two ways:
  // 1. Using Object.prototype.toString.call
  // 2. Using typeof operator
  return Object.prototype.toString.call(value) === '[object String]' || typeof value === 'string';
}

// Exporting the isString function for use in other files
module.exports = isString;

// test/testIsString.js

'use strict';

// Assertion library for checking test cases
const assert = require('assert');
// Importing the isString function to test it
const isString = require('../src/isString');

// Test cases for values that are not strings
assert.notStrictEqual(isString(undefined), true);
assert.notStrictEqual(isString(null), true);
assert.notStrictEqual(isString(false), true);
assert.notStrictEqual(isString(true), true);
assert.notStrictEqual(isString(function() {}), true);
assert.notStrictEqual(isString([]), true);
assert.notStrictEqual(isString({}), true);
assert.notStrictEqual(isString(/a/g), true);
assert.notStrictEqual(isString(new RegExp('a', 'g')), true);
assert.notStrictEqual(isString(new Date()), true);
assert.notStrictEqual(isString(42), true);
assert.notStrictEqual(isString(NaN), true);
assert.notStrictEqual(isString(Infinity), true);
assert.notStrictEqual(isString(new Number(42)), true);

// Test cases for values that are strings
assert.strictEqual(isString('foo'), true);
assert.strictEqual(isString(Object('foo')), true);

// Log a success message if all tests pass
console.log('All tests passed!');

// Running tests directly if this file is executed
if (require.main === module) {
  console.log('Running tests...');
  require('./testIsString');
}

// package.json

{
  "name": "is-string",
  "version": "1.0.0",
  "main": "src/isString.js",
  "scripts": {
    "test": "node test/testIsString.js"
  },
  "devDependencies": {
  },
  "dependencies": {
  },
  "author": "",
  "license": "ISC"
}
