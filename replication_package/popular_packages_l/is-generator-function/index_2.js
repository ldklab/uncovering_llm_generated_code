// index.js
function isGeneratorFunction(fn) {
  // Check if the provided argument is a function
  if (typeof fn !== 'function') {
    return false;  // Return false if the argument is not a function
  }
  const constructor = fn.constructor;  // Get the constructor of the function
  if (!constructor) {
    return false;  // Return false if the constructor is not available
  }
  // Determine if the function is a generator function by inspecting its constructor
  if (constructor.name === 'GeneratorFunction' || constructor === (function*(){}).constructor) {
    return true;  // Return true if the function is a generator function
  }
  return false;  // Return false in all other cases
}

module.exports = isGeneratorFunction;  // Export the function for use in other files

// test.js
const assert = require('assert');  // Import the assert module for testing
const isGeneratorFunction = require('./index');  // Import the function to be tested

// Test cases to verify the functionality of isGeneratorFunction
assert(!isGeneratorFunction(function () {}));  // Test with a regular function
assert(!isGeneratorFunction(null));  // Test with a non-function value
assert(isGeneratorFunction(function* () { yield 42; return Infinity; }));  // Test with a generator function

console.log("All tests passed!");  // Log a success message on passing all tests

// package.json
{
  "name": "is-generator-function",  // Name of the package
  "version": "1.0.0",  // Version of the package
  "description": "Determine if a function is a native generator function",  // Description of the package
  "main": "index.js",  // Entry point of the package
  "scripts": {
    "test": "node test.js"  // Define a test script that runs the test.js file
  },
  "author": "",  // Author of the package (left blank)
  "license": "MIT"  // License information
}
