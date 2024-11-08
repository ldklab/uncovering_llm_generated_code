// File: index.js
function getSymbolDescription(symbol) {
  if (typeof symbol !== 'symbol') {
    throw new TypeError('Expected a symbol');
  }
  // Utilize the native 'description' property if it exists
  if ('description' in symbol) {
    return symbol.description;
  }
  
  // Alternative method for environments lacking native description support
  const symbolString = String(symbol);
  const symbolPrefix = 'Symbol(';
  const symbolSuffix = ')';
  
  if (symbolString.startsWith(symbolPrefix) && symbolString.endsWith(symbolSuffix)) {
    const description = symbolString.slice(symbolPrefix.length, -symbolSuffix.length);
    return description || undefined;
  }
  
  return undefined;
}

module.exports = getSymbolDescription;

// Tests: test/test.js
const getSymbolDescription = require('../index');
const assert = require('assert');

// Test cases to verify function functionality
assert.strictEqual(getSymbolDescription(Symbol()), undefined);
assert.strictEqual(getSymbolDescription(Symbol('')), '');
assert.strictEqual(getSymbolDescription(Symbol('foo')), 'foo');
assert.strictEqual(getSymbolDescription(Symbol.iterator), 'Symbol.iterator');

// Setup: package.json
{
  "name": "get-symbol-description",
  "version": "1.0.0",
  "description": "Retrieves the description of a Symbol",
  "main": "index.js",
  "scripts": {
    "test": "node test/test.js"
  },
  "author": "",
  "license": "MIT"
}

// Instructions to run tests
// 1. Clone the repository.
// 2. Navigate to the project directory.
// 3. Execute the following commands to test:
//    npm install
//    npm test
