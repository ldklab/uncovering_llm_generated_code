// is-set/index.js
function isSet(value) {
  return Object.prototype.toString.call(value) === '[object Set]';
}

module.exports = isSet;

// is-set/test/test.js
const assert = require('assert');
const isSet = require('../index.js');

assert.strictEqual(isSet(function() {}), false, 'Function is not a Set');
assert.strictEqual(isSet(null), false, 'null is not a Set');
assert.strictEqual(isSet(function* () { yield 42; return Infinity; }), false, 'Generator is not a Set');
assert.strictEqual(isSet(Symbol('foo')), false, 'Symbol is not a Set');
assert.strictEqual(isSet(1n), false, 'BigInt is not a Set');
assert.strictEqual(isSet(Object(1n)), false, 'Object-wrapped BigInt is not a Set');
assert.strictEqual(isSet(new Map()), false, 'Map is not a Set');
assert.strictEqual(isSet(new WeakSet()), false, 'WeakSet is not a Set');
assert.strictEqual(isSet(new WeakMap()), false, 'WeakMap is not a Set');

assert.strictEqual(isSet(new Set()), true, 'Set is a Set');

class MySet extends Set {}
assert.strictEqual(isSet(new MySet()), true, 'Subclass of Set is a Set');

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
