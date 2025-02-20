markdown
// index.js
/**
 * Determines if the provided function is a generator function.
 *
 * @param {Function} fn - The function to test.
 * @returns {boolean} - True if the function is a generator function, otherwise false.
 */
function isGeneratorFunction(fn) {
  // Check if the input is a function
  if (typeof fn !== 'function') {
    return false;
  }

  const constructor = fn.constructor;
  // Check if the function's constructor exists
  if (!constructor) {
    return false;
  }
  
  // Check if the constructor name matches 'GeneratorFunction' or
  // if it is the same as the constructor of a generator function instance
  return constructor.name === 'GeneratorFunction' || constructor === (function*(){}).constructor;
}

module.exports = isGeneratorFunction;

// test.js
const assert = require('assert');
const isGeneratorFunction = require('./index');

// Test cases to verify the functionality of isGeneratorFunction
// Regular function should return false
assert(!isGeneratorFunction(function () {}));
// Null should return false
assert(!isGeneratorFunction(null));
// Generator function should return true
assert(isGeneratorFunction(function* () { yield 42; return Infinity; }));

console.log("All tests passed!");

// package.json
{
  "name": "is-generator-function",
  "version": "1.0.0",
  "description": "Determine if a function is a native generator function",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "author": "",
  "license": "MIT"
}
