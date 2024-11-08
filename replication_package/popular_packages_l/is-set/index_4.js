// is-set/index.js
function isSet(value) {
  return Object.prototype.toString.call(value) === '[object Set]';
}

module.exports = isSet;

// is-set/test/test.js
const assert = require('assert');
const isSet = require('../index.js');

// Test cases to verify the isSet function
const tests = [
  { value: function() {}, expected: false, description: 'Function is not a Set' },
  { value: null, expected: false, description: 'null is not a Set' },
  { value: function* () { yield 42; return Infinity; }, expected: false, description: 'Generator is not a Set' },
  { value: Symbol('foo'), expected: false, description: 'Symbol is not a Set' },
  { value: 1n, expected: false, description: 'BigInt is not a Set' },
  { value: Object(1n), expected: false, description: 'Object-wrapped BigInt is not a Set' },
  { value: new Map(), expected: false, description: 'Map is not a Set' },
  { value: new WeakSet(), expected: false, description: 'WeakSet is not a Set' },
  { value: new WeakMap(), expected: false, description: 'WeakMap is not a Set' },
  { value: new Set(), expected: true, description: 'Set is a Set' },
  { value: new (class MySet extends Set {}), expected: true, description: 'Subclass of Set is a Set' }
];

// Run the test cases
tests.forEach(({ value, expected, description }) => {
  assert.strictEqual(isSet(value), expected, description);
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
