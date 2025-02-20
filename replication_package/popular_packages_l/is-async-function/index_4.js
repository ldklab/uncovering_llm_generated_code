// is-async-function.js
function isAsyncFunction(fn) {
    // Determine whether the provided argument is an async function
    return typeof fn === 'function' && fn.constructor.name === 'AsyncFunction';
}

module.exports = isAsyncFunction;

// test.js
const assert = require('assert');
const isAsyncFunction = require('./is-async-function');

// Test cases verifying the function behavior
assert(!isAsyncFunction(function () {}), 'Regular functions should return false'); // Regular function
assert(!isAsyncFunction(null), 'Null should return false'); // Null value
assert(!isAsyncFunction(function* () { yield 42; return Infinity; }), 'Generator functions should return false'); // Generator function
assert(isAsyncFunction(async function () {}), 'Async functions should return true'); // Async function

// package.json
{
  "name": "is-async-function",
  "version": "1.0.0",
  "description": "Check if a function is an AsyncFunction.",
  "main": "is-async-function.js",
  "scripts": {
    "test": "node test.js"
  },
  "author": "",
  "license": "ISC"
}
