// isAsyncFunction.js
function isAsyncFunction(fn) {
    // Check if the input is a function and if its constructor is named 'AsyncFunction'
    return typeof fn === 'function' && fn.constructor.name === 'AsyncFunction';
}

module.exports = isAsyncFunction;

// test.js
const assert = require('assert');
const isAsyncFunction = require('./isAsyncFunction');

// Test cases to verify the functionality of isAsyncFunction
assert.strictEqual(isAsyncFunction(function () {}), false, 'Regular functions should return false');
assert.strictEqual(isAsyncFunction(null), false, 'Null should return false');
assert.strictEqual(
    isAsyncFunction(function* () { yield 42; return Infinity; }),
    false,
    'Generator functions should return false'
);
assert.strictEqual(isAsyncFunction(async function () {}), true, 'Async functions should return true');

// package.json
{
  "name": "is-async-function",
  "version": "1.0.0",
  "description": "Determine if a function is an async function",
  "main": "isAsyncFunction.js",
  "scripts": {
    "test": "node test.js"
  },
  "author": "",
  "license": "ISC"
}
