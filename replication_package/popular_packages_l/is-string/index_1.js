// src/isString.js

'use strict';

// Function to check if a given value is a string.
// It verifies this by comparing the type of the value or its internal Object type.
function isString(value) {
  return Object.prototype.toString.call(value) === '[object String]' || typeof value === 'string';
}

module.exports = isString;

// test/isString.test.js

'use strict';

// Import the 'assert' library for making assertions in the tests.
var assert = require('assert');

// Import the isString function to test it.
var isString = require('../src/isString');

// Test cases covering various types of non-string values
assert.notOk(isString(undefined), 'undefined should not be a string');
assert.notOk(isString(null), 'null should not be a string');
assert.notOk(isString(false), 'false should not be a string');
assert.notOk(isString(true), 'true should not be a string');
assert.notOk(isString(function() {}), 'function should not be a string');
assert.notOk(isString([]), 'array should not be a string');
assert.notOk(isString({}), 'object should not be a string');
assert.notOk(isString(/a/g), 'regular expression literal should not be a string');
assert.notOk(isString(new RegExp('a', 'g')), 'RegExp object should not be a string');
assert.notOk(isString(new Date()), 'Date object should not be a string');
assert.notOk(isString(42), 'number should not be a string');
assert.notOk(isString(NaN), 'NaN should not be a string');
assert.notOk(isString(Infinity), 'Infinity should not be a string');
assert.notOk(isString(new Number(42)), 'Number object should not be a string');

// Test cases for valid string values
assert.ok(isString('foo'), 'string literal should be a string');
assert.ok(isString(Object('foo')), 'String object should be a string');

console.log('All tests passed!');

// Running the tests when the module is executed directly.
if (require.main === module) {
  console.log('Running tests...');
  require('./isString.test');
}

// package.json

{
  "name": "is-string",
  "version": "1.0.0",
  "main": "src/isString.js",
  "scripts": {
    "test": "node test/isString.test.js"
  },
  "devDependencies": {
  },
  "dependencies": {
  },
  "author": "",
  "license": "ISC"
}
