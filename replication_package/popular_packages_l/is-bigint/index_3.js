markdown
// is-bigint/index.js
const isBigInt = value => 
    typeof value === 'bigint' || 
    (Object.prototype.toString.call(value) === '[object BigInt]' && value !== null);

module.exports = isBigInt;

// is-bigint/test.js
const assert = require('assert');
const isBigInt = require('./index');

// Test cases
const testCases = [
  { value: function() {}, expected: false },
  { value: null, expected: false },
  { value: function* () { yield 42; return Infinity; }, expected: false },
  { value: Symbol('foo'), expected: false },
  { value: 1n, expected: true },
  { value: Object(1n), expected: true }
];

testCases.forEach(({ value, expected }, index) => {
  assert.strictEqual(isBigInt(value), expected, `Test case #${index + 1} failed`);
});

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
