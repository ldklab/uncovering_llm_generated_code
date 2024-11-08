markdown
// lib/is-date-object.js
const isDateObject = (value) => {
  return Object.prototype.toString.call(value) === '[object Date]';
};

module.exports = isDateObject;

// test/index.js
const assert = require('assert');
const isDate = require('../lib/is-date-object');

const testCases = [
  { value: undefined, expected: false, message: 'undefined is not a Date' },
  { value: null, expected: false, message: 'null is not a Date' },
  { value: false, expected: false, message: 'false is not a Date' },
  { value: true, expected: false, message: 'true is not a Date' },
  { value: 42, expected: false, message: '42 is not a Date' },
  { value: 'foo', expected: false, message: '"foo" is not a Date' },
  { value: () => {}, expected: false, message: 'function is not a Date' },
  { value: [], expected: false, message: 'array is not a Date' },
  { value: {}, expected: false, message: 'object is not a Date' },
  { value: /a/g, expected: false, message: 'regex literal is not a Date' },
  { value: new RegExp('a', 'g'), expected: false, message: 'regex object is not a Date' },
  { value: new Date(), expected: true, message: 'new Date() is a Date' }
];

testCases.forEach(({ value, expected, message }) => {
  assert.strictEqual(isDate(value), expected, message);
});

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
