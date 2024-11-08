// functions-have-names.js
module.exports = function functionsHaveNames() {
    const testFunction = function () {};
    return typeof testFunction.name === 'string' && testFunction.name.length > 0;
};

// test-functions-have-names.js
const functionsHaveNames = require('./functions-have-names');
const assert = require('assert');

try {
    assert.strictEqual(functionsHaveNames(), true);
    console.log('Test passed: Environment supports function names.');
} catch (error) {
    console.error('Test failed: ', error.message);
}

// package.json
{
  "name": "functions-have-names",
  "version": "1.1.0",
  "description": "Check if the current JavaScript environment supports the `name` property on function expressions.",
  "main": "functions-have-names.js",
  "scripts": {
    "test": "node test-functions-have-names.js"
  },
  "author": "Your Name",
  "license": "MIT"
}

// Run the test with the following commands:
// npm install
// npm test
