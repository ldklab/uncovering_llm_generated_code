// File: index.js

// This function retrieves the description of a symbol.
// It first checks if the input is a symbol and throws an error if not.
// If the JavaScript engine supports the `description` property, it uses it.
// Otherwise, it attempts to manually extract the description from the string representation of the symbol.
function getSymbolDescription(symbol) {
  // Validate input type
  if (typeof symbol !== 'symbol') {
    throw new TypeError('Expected a symbol');
  }
  
  // If the engine natively supports the description property, use it
  if ('description' in symbol) {
    return symbol.description;
  }
  
  // Fallback for environments without description support
  var symbolString = String(symbol);
  var symbolPrefix = 'Symbol(';
  var symbolSuffix = ')';
  
  // Check if the symbol string matches the expected Symbol format
  if (symbolString.startsWith(symbolPrefix) && symbolString.endsWith(symbolSuffix)) {
    var description = symbolString.slice(symbolPrefix.length, -symbolSuffix.length);
    return description || undefined;
  }
  
  return undefined;
}

module.exports = getSymbolDescription;

// Tests: test/test.js

// Import the function and the assertion library for testing
var getSymbolDescription = require('../index');
var assert = require('assert');

// Define tests to ensure our function behaves as expected
assert.strictEqual(getSymbolDescription(Symbol()), undefined, 'Symbol with no description should result in undefined');
assert.strictEqual(getSymbolDescription(Symbol('')), '', 'Symbol with empty description should return an empty string');
assert.strictEqual(getSymbolDescription(Symbol('foo')), 'foo', 'Symbol with description "foo" should return "foo"');
assert.strictEqual(getSymbolDescription(Symbol.iterator), 'Symbol.iterator', 'Well-known symbol should return its standard name');

// Setup: package.json

// This configuration sets up the package metadata and test script
{
  "name": "get-symbol-description",
  "version": "1.0.0",
  "description": "Gets the description of a Symbol",
  "main": "index.js",
  "scripts": {
    "test": "node test/test.js"
  },
  "author": "",
  "license": "MIT"
}

// Instructions on how to test
// Clone the repository, navigate to the directory, and run:

// 1. Install dependencies (if any): npm install
// 2. Run the tests: npm test
