markdown
// File: index.js
function getSymbolDescription(symbol) {
  if (typeof symbol !== 'symbol') {
    throw new TypeError('Expected a symbol');
  }
  // Use native description property if available
  if ('description' in symbol) {
    return symbol.description;
  }
  
  // Fallback for engines without native description support
  var symbolString = String(symbol);
  var symbolPrefix = 'Symbol(';
  var symbolSuffix = ')';
  
  if (symbolString.slice(0, symbolPrefix.length) === symbolPrefix && symbolString.slice(-symbolSuffix.length) === symbolSuffix) {
    var description = symbolString.slice(symbolPrefix.length, -symbolSuffix.length);
    return description || undefined;
  }
  
  return undefined;
}

module.exports = getSymbolDescription;

// Tests: test/test.js
var getSymbolDescription = require('../index');
var assert = require('assert');

assert.strictEqual(getSymbolDescription(Symbol()), undefined);
assert.strictEqual(getSymbolDescription(Symbol('')), '');
assert.strictEqual(getSymbolDescription(Symbol('foo')), 'foo');
assert.strictEqual(getSymbolDescription(Symbol.iterator), 'Symbol.iterator');

// Setup: package.json
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
// Clone the repository, navigate to the directory, and run the following commands to test:
// npm install
// npm test