// is-set/index.js
const isSet = (value) => Object.prototype.toString.call(value) === '[object Set]';

module.exports = isSet;

// is-set/test/test.js
const assert = require('assert');
const isSet = require('../index.js');

const testCases = [
  { value: function () {}, expected: false, message: 'Function is not a Set' },
  { value: null, expected: false, message: 'null is not a Set' },
  { value: function* () { yield 42; return Infinity; }, expected: false, message: 'Generator is not a Set' },
  { value: Symbol('foo'), expected: false, message: 'Symbol is not a Set' },
  { value: 1n, expected: false, message: 'BigInt is not a Set' },
  { value: Object(1n), expected: false, message: 'Object-wrapped BigInt is not a Set' },
  { value: new Map(), expected: false, message: 'Map is not a Set' },
  { value: new WeakSet(), expected: false, message: 'WeakSet is not a Set' },
  { value: new WeakMap(), expected: false, message: 'WeakMap is not a Set' },
  { value: new Set(), expected: true, message: 'Set is a Set' },
  { value: new (class MySet extends Set {})(), expected: true, message: 'Subclass of Set is a Set' }
];

testCases.forEach(({ value, expected, message }) => {
  assert.strictEqual(isSet(value), expected, message);
});

console.log('All tests passed');

// is-set/package.json
{
  "name": "is-set",
  "version": "1.0.0",
  "description": "Determine if a given value is a JS Set",
  "main": "index.js",
  "scripts": {
    "test": "node test/test.js"
  },
  "author": "",
  "license": "MIT"
}
