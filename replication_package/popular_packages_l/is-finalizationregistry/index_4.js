// is-finalizationregistry.js
'use strict';

// Checks if the input is a FinalizationRegistry instance.
function isFinalizationRegistry(value) {
  // Ensure the value is an object
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  // Verify the presence of the `constructor` property and ensure its prototype is FinalizationRegistry
  // Use instance check for cross-realm correctness.
  return typeof value.constructor === 'function' &&
         value.constructor.prototype &&
         value instanceof value.constructor &&
         (Object.prototype.toString.call(value) === '[object FinalizationRegistry]' ||
          Object.prototype.toString.call(value) === '[object Object]' &&
          value.constructor.name === 'FinalizationRegistry');
}

module.exports = isFinalizationRegistry;

// test.js
'use strict';

const assert = require('assert');
const isFinalizationRegistry = require('./is-finalizationregistry');

// Test various inputs to ensure correct functionality
assert.strictEqual(isFinalizationRegistry(function () {}), false, 'Function should not be FinalizationRegistry');
assert.strictEqual(isFinalizationRegistry(null), false, 'Null should not be FinalizationRegistry');
assert.strictEqual(isFinalizationRegistry(function* () { yield 42; return Infinity; }), false, 'Generator function should not be FinalizationRegistry');
assert.strictEqual(isFinalizationRegistry(Symbol('foo')), false, 'Symbol should not be FinalizationRegistry');
assert.strictEqual(isFinalizationRegistry(1n), false, 'BigInt primitive should not be FinalizationRegistry');
assert.strictEqual(isFinalizationRegistry(Object(1n)), false, 'BigInt object should not be FinalizationRegistry');

assert.strictEqual(isFinalizationRegistry(new Set()), false, 'Set should not be FinalizationRegistry');
assert.strictEqual(isFinalizationRegistry(new WeakSet()), false, 'WeakSet should not be FinalizationRegistry');
assert.strictEqual(isFinalizationRegistry(new Map()), false, 'Map should not be FinalizationRegistry');
assert.strictEqual(isFinalizationRegistry(new WeakMap()), false, 'WeakMap should not be FinalizationRegistry');
assert.strictEqual(isFinalizationRegistry(new WeakRef({})), false, 'WeakRef should not be FinalizationRegistry');

assert.strictEqual(isFinalizationRegistry(new FinalizationRegistry(function () {})), true, 'Instance should be FinalizationRegistry');

// Test derived class
class MyFinalizationRegistry extends FinalizationRegistry {}
assert.strictEqual(isFinalizationRegistry(new MyFinalizationRegistry(function () {})), true, 'Derived instance should be FinalizationRegistry');

console.log('All tests passed!');

// package.json
{
  "name": "is-finalizationregistry",
  "version": "1.0.0",
  "description": "Check if a value is a JS FinalizationRegistry",
  "main": "is-finalizationregistry.js",
  "scripts": {
    "test": "node test.js"
  },
  "keywords": [
    "FinalizationRegistry",
    "type-checking",
    "javascript"
  ],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "assert": "^2.0.0"
  }
}
