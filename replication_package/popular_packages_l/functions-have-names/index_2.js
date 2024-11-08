// functions-have-names.js
module.exports = function checkFunctionNamesSupport() {
    var anonymousFunction = function () {};
    return typeof anonymousFunction.name === 'string' && anonymousFunction.name !== '';
};

// test-functions-have-names.js
const checkFunctionNamesSupport = require('./functions-have-names');
const assert = require('assert');

assert.strictEqual(checkFunctionNamesSupport(), true);

// package.json
{
  "name": "function-name-support-check",
  "version": "1.0.0",
  "description": "Determine if the JS environment supports the `name` property on functions.",
  "main": "functions-have-names.js",
  "scripts": {
    "test": "node test-functions-have-names.js"
  },
  "author": "Your Name",
  "license": "MIT"
}

// To test the package, run the following commands in the terminal:
// npm install
// npm test
