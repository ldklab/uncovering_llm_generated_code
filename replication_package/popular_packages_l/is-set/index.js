markdown
// is-set/index.js
function isSet(value) {
  return Object.prototype.toString.call(value) === '[object Set]';
}

module.exports = isSet;

// is-set/test/test.js
const assert = require('assert');
const isSet = require('../index.js');

assert(!isSet(function () {}), 'Function is not a Set');
assert(!isSet(null), 'null is not a Set');
assert(!isSet(function* () { yield 42; return Infinity; }), 'Generator is not a Set');
assert(!isSet(Symbol('foo')), 'Symbol is not a Set');
assert(!isSet(1n), 'BigInt is not a Set');
assert(!isSet(Object(1n)), 'Object-wrapped BigInt is not a Set');
assert(!isSet(new Map()), 'Map is not a Set');
assert(!isSet(new WeakSet()), 'WeakSet is not a Set');
assert(!isSet(new WeakMap()), 'WeakMap is not a Set');

assert(isSet(new Set()), 'Set is a Set');

class MySet extends Set {}
assert(isSet(new MySet()), 'Subclass of Set is a Set');

// Run the tests
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
