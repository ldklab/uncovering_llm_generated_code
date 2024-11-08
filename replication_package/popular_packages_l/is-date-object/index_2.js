// lib/is-date-object.js
const isDateObject = (value) => Object.prototype.toString.call(value) === '[object Date]';

module.exports = isDateObject;

// test/index.js
const assert = require('assert');
const isDate = require('../lib/is-date-object');

const testCases = [
  { value: undefined, expectedResult: false, description: 'undefined is not a Date' },
  { value: null, expectedResult: false, description: 'null is not a Date' },
  { value: false, expectedResult: false, description: 'false is not a Date' },
  { value: true, expectedResult: false, description: 'true is not a Date' },
  { value: 42, expectedResult: false, description: '42 is not a Date' },
  { value: 'foo', expectedResult: false, description: '"foo" is not a Date' },
  { value: function() {}, expectedResult: false, description: 'function is not a Date' },
  { value: [], expectedResult: false, description: 'array is not a Date' },
  { value: {}, expectedResult: false, description: 'object is not a Date' },
  { value: /a/g, expectedResult: false, description: 'regex literal is not a Date' },
  { value: new RegExp('a', 'g'), expectedResult: false, description: 'regex object is not a Date' },
  { value: new Date(), expectedResult: true, description: 'new Date() is a Date' }
];

testCases.forEach(test => 
  assert.strictEqual(isDate(test.value), test.expectedResult, test.description)
);

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
