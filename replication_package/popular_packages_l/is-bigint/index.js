markdown
// is-bigint/index.js
function isBigInt(value) {
    return typeof value === 'bigint' || (typeof value === 'object' && value !== null && Object.prototype.toString.call(value) === '[object BigInt]');
}

module.exports = isBigInt;

// is-bigint/test.js
const assert = require('assert');
const isBigInt = require('./index');

// Test cases
assert(!isBigInt(function () {}));
assert(!isBigInt(null));
assert(!isBigInt(function* () { yield 42; return Infinity; }));
assert(!isBigInt(Symbol('foo')));

assert(isBigInt(1n));
assert(isBigInt(Object(1n)));

console.log('All tests passed!');

// package.json
{
  "name": "is-bigint",
  "version": "1.0.0",
  "description": "Is this an ES BigInt value?",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "keywords": ["BigInt", "check", "type"],
  "author": "",
  "license": "ISC"
}
