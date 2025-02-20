// index.js
function isGeneratorFunction(fn) {
  if (typeof fn !== 'function') {
    return false;
  }
  const constructor = fn.constructor;
  if (!constructor) {
    return false;
  }
  // Check if function is a generator function using its constructor
  if (constructor.name === 'GeneratorFunction' || constructor === (function*(){}).constructor) {
    return true;
  }
  return false;
}

module.exports = isGeneratorFunction;

// test.js
const assert = require('assert');
const isGeneratorFunction = require('./index');

assert.strictEqual(isGeneratorFunction(function () {}), false);
assert.strictEqual(isGeneratorFunction(null), false);
assert.strictEqual(isGeneratorFunction(function* () { yield 42; return Infinity; }), true);

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
