markdown
// lib/is-date-object.js
function isDateObject(value) {
  return Object.prototype.toString.call(value) === '[object Date]';
}

module.exports = isDateObject;

// test/index.js
var assert = require('assert');
var isDate = require('../lib/is-date-object');

assert.notOk(isDate(undefined), 'undefined is not a Date');
assert.notOk(isDate(null), 'null is not a Date');
assert.notOk(isDate(false), 'false is not a Date');
assert.notOk(isDate(true), 'true is not a Date');
assert.notOk(isDate(42), '42 is not a Date');
assert.notOk(isDate('foo'), '"foo" is not a Date');
assert.notOk(isDate(function () {}), 'function is not a Date');
assert.notOk(isDate([]), 'array is not a Date');
assert.notOk(isDate({}), 'object is not a Date');
assert.notOk(isDate(/a/g), 'regex literal is not a Date');
assert.notOk(isDate(new RegExp('a', 'g')), 'regex object is not a Date');
assert.ok(isDate(new Date()), 'new Date() is a Date');

console.log('All tests passed');

// package.json
{
  "name": "is-date-object",
  "version": "1.0.0",
  "description": "Is this value a JS Date object?",
  "main": "lib/is-date-object.js",
  "scripts": {
    "test": "node test/index.js"
  },
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "assert": "^1.5.0"
  }
}

// LICENSE
The MIT License (MIT)

// README.md
# is-date-object

Is this value a JS Date object? This module works cross-realm/iframe, and despite ES6 @@toStringTag.

## Example
