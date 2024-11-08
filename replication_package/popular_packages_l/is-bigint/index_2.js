// is-bigint/index.js
function isBigInt(value) {
    // Check if the type of the value is 'bigint' or if it's an object representation of a BigInt
    return typeof value === 'bigint' || (typeof value === 'object' && value !== null && Object.prototype.toString.call(value) === '[object BigInt]');
}

module.exports = isBigInt;

// is-bigint/test.js
const assert = require('assert');
const isBigInt = require('./index');

// Test cases to verify if the isBigInt function works correctly
assert.strictEqual(isBigInt(function () {}), false, 'Function is not a BigInt');
assert.strictEqual(isBigInt(null), false, 'null is not a BigInt');
assert.strictEqual(isBigInt(function* () { yield 42; return Infinity; }), false, 'Generator is not a BigInt');
assert.strictEqual(isBigInt(Symbol('foo')), false, 'Symbol is not a BigInt');

assert.strictEqual(isBigInt(1n), true, '1n is a BigInt');
assert.strictEqual(isBigInt(Object(1n)), true, 'Object(1n) is a BigInt');

console.log('All tests passed!');

// package.json
{
  "name": "is-bigint",
  "version": "1.0.0",
  "description": "Is this an ES BigInt value?",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"  // Script to run the test file using Node.js
  },
  "keywords": ["BigInt", "check", "type"],
  "author": "",
  "license": "ISC"
}
