// is-async-function.js
function isAsyncFunction(fn) {
    // Check if the input is a function and has a special constructor
    return typeof fn === 'function' && fn.constructor.name === 'AsyncFunction';
}

module.exports = isAsyncFunction;

// test.js
const assert = require('assert');
const isAsyncFunction = require('./is-async-function');

// Test cases
assert(!isAsyncFunction(function () {}), 'Regular functions should return false');
assert(!isAsyncFunction(null), 'Null should return false');
assert(!isAsyncFunction(function* () { yield 42; return Infinity; }), 'Generator functions should return false');
assert(isAsyncFunction(async function () {}), 'Async functions should return true');

// package.json
{
  "name": "is-async-function",
  "version": "1.0.0",
  "description": "Is this a native async function?",
  "main": "is-async-function.js",
  "scripts": {
    "test": "node test.js"
  },
  "author": "",
  "license": "ISC"
}
