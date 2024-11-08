// index.js
function isGeneratorFunction(fn) {
  if (typeof fn !== 'function') {
    return false;
  }
  const constructor = fn.constructor;
  if (!constructor) {
    return false;
  }
  // Check if the function is a generator function using its constructor
  return constructor.name === 'GeneratorFunction' || constructor === (function*(){}).constructor;
}

module.exports = isGeneratorFunction;

// test.js
const assert = require('assert');
const isGeneratorFunction = require('./index');

assert(!isGeneratorFunction(function () {})); // Test with a regular function
assert(!isGeneratorFunction(null)); // Test with a non-function value
assert(isGeneratorFunction(function* () { yield 42; return Infinity; })); // Test with a generator function

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
