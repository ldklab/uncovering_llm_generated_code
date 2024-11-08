// isAsyncFunction.js
/**
 * Checks if a given function is an async function.
 * 
 * @param {Function} fn - The function to check.
 * @returns {boolean} - True if the function is an async function, false otherwise.
 */
function isAsyncFunction(fn) {
    // Check if the given input is a function and its constructor name is 'AsyncFunction'
    return typeof fn === 'function' && fn.constructor.name === 'AsyncFunction';
}

module.exports = isAsyncFunction;

// test.js
const assert = require('assert');
const isAsyncFunction = require('./isAsyncFunction');

// Test cases to ensure that isAsyncFunction works correctly
assert(!isAsyncFunction(function () {}), 'Regular functions should return false'); // Test with a standard function
assert(!isAsyncFunction(null), 'Null should return false'); // Test with null (not a function)
assert(!isAsyncFunction(function* () { yield 42; return Infinity; }), 'Generator functions should return false'); // Test with a generator function
assert(isAsyncFunction(async function () {}), 'Async functions should return true'); // Test with an async function

// package.json
{
  "name": "is-async-function",
  "version": "1.0.0",
  "description": "A utility to check if a function is an async function.",
  "main": "isAsyncFunction.js",
  "scripts": {
    "test": "node test.js"
  },
  "author": "",
  "license": "ISC"
}
