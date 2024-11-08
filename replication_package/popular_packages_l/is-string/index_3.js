// is-string/index.js

'use strict';

/**
 * Checks if a given value is of type string.
 * The function first checks if the `Object.prototype.toString` returns `[object String]`
 * which handles string objects created with `new String()`. If that check fails,
 * it uses the `typeof` operator to check if the value is a primitive string.
 * 
 * @param {*} value - The value to check.
 * @returns {boolean} - Returns `true` if the value is a string, otherwise `false`.
 */
function isString(value) {
  return Object.prototype.toString.call(value) === '[object String]' || typeof value === 'string';
}

module.exports = isString;

// is-string/test/test.js

'use strict';

var assert = require('assert');
var isString = require('../index');

// Test cases to validate the isString function
assert.notOk(isString(undefined), 'undefined is not a string');
assert.notOk(isString(null), 'null is not a string');
assert.notOk(isString(false), 'false is not a string');
assert.notOk(isString(true), 'true is not a string');
assert.notOk(isString(function() {}), 'function is not a string');
assert.notOk(isString([]), 'array is not a string');
assert.notOk(isString({}), 'object is not a string');
assert.notOk(isString(/a/g), 'regex literal is not a string');
assert.notOk(isString(new RegExp('a', 'g')), 'regex object is not a string');
assert.notOk(isString(new Date()), 'date object is not a string');
assert.notOk(isString(42), 'number is not a string');
assert.notOk(isString(NaN), 'NaN is not a string');
assert.notOk(isString(Infinity), 'Infinity is not a string');
assert.notOk(isString(new Number(42)), 'number object is not a string');

assert.ok(isString('foo'), 'string literal is a string');
assert.ok(isString(Object('foo')), 'string object is a string');

console.log('All tests passed!');

// Script to run tests directly with Node.js without using a testing framework
if (require.main === module) {
  console.log('Running tests...');
  require('./test');
}

// is-string/package.json

{
  "name": "is-string",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "node test/test.js"
  },
  "devDependencies": {
  },
  "dependencies": {
  },
  "author": "",
  "license": "ISC"
}
