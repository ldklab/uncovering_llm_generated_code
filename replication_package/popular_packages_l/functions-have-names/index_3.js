json
// functions-have-names.js
module.exports = function functionsHaveNames() {
    var testFunction = function () {};
    return typeof testFunction.name === 'string' && testFunction.name !== '';
};

// test-functions-have-names.js
var functionsHaveNames = require('./functions-have-names');
var assert = require('assert');

assert.equal(functionsHaveNames(), true);

// package.json
{
  "name": "functions-have-names",
  "version": "1.0.0",
  "description": "Check if the current JS environment supports the `name` property on functions.",
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
