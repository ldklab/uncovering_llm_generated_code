markdown
// lib/is-date-object.js
const isDateObject = value => {
  return Object.prototype.toString.call(value) === '[object Date]';
};

module.exports = isDateObject;

// test/index.js
const assert = require('assert');
const isDate = require('../lib/is-date-object');

assert.strictEqual(isDate(undefined), false, 'undefined is not a Date');
assert.strictEqual(isDate(null), false, 'null is not a Date');
assert.strictEqual(isDate(false), false, 'false is not a Date');
assert.strictEqual(isDate(true), false, 'true is not a Date');
assert.strictEqual(isDate(42), false, '42 is not a Date');
assert.strictEqual(isDate('foo'), false, '"foo" is not a Date');
assert.strictEqual(isDate(() => {}), false, 'function is not a Date');
assert.strictEqual(isDate([]), false, 'array is not a Date');
assert.strictEqual(isDate({}), false, 'object is not a Date');
assert.strictEqual(isDate(/a/g), false, 'regex literal is not a Date');
assert.strictEqual(isDate(new RegExp('a', 'g')), false, 'regex object is not a Date');
assert.strictEqual(isDate(new Date()), true, 'new Date() is a Date');

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
