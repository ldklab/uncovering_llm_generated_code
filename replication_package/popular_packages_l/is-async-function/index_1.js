// is-async-function.js
/**
 * Determines whether the provided function is an asynchronous function.
 *
 * @param {Function} fn - The function to check.
 * @returns {boolean} - Returns true if the function is asynchronous, false otherwise.
 */
function isAsyncFunction(fn) {
    // Check if the input is a function and has a constructor named 'AsyncFunction'
    return typeof fn === 'function' && fn.constructor.name === 'AsyncFunction';
}

module.exports = isAsyncFunction;

// test.js
const assert = require('assert');
const isAsyncFunction = require('./is-async-function');

// Test cases to validate the isAsyncFunction implementation
assert.strictEqual(isAsyncFunction(function () {}), false, 'Regular functions should return false');
assert.strictEqual(isAsyncFunction(null), false, 'Null should return false');
assert.strictEqual(isAsyncFunction(function* () { yield 42; return Infinity; }), false, 'Generator functions should return false');
assert.strictEqual(isAsyncFunction(async function () {}), true, 'Async functions should return true');

// package.json
{
  "name": "is-async-function",
  "version": "1.0.0",
  "description": "Determines whether a given function is a native async function.",
  "main": "is-async-function.js",
  "scripts": {
    "test": "node test.js"
  },
  "author": "",
  "license": "ISC"
}
