json
// functions-have-names.js
module.exports = function checkFunctionNamesSupport() {
    const testFunction = () => {};
    return typeof testFunction.name === 'string' && testFunction.name !== '';
};

// test-functions-have-names.js
const checkFunctionNamesSupport = require('./functions-have-names');
const assert = require('assert');

assert.strictEqual(checkFunctionNamesSupport(), true, 'The environment does not support named functions.');

// package.json
{
  "name": "functions-have-names",
  "version": "1.0.0",
  "description": "Detects whether the JavaScript environment supports named functions.",
  "main": "functions-have-names.js",
  "scripts": {
    "test": "node test-functions-have-names.js"
  },
  "author": "Your Name",
  "license": "MIT"
}

// To test the package:
// $ npm install
// $ npm test
