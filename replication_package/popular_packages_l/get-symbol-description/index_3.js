// File: index.js
function getSymbolDescription(symbol) {
  if (typeof symbol !== 'symbol') {
    throw new TypeError('Expected a symbol');
  }

  return symbol.description !== undefined ? symbol.description : (String(symbol).match(/^Symbol\((.*)\)$/) || [])[1];
}

module.exports = getSymbolDescription;

// Tests: test/test.js
const getSymbolDescription = require('../index');
const assert = require('assert');

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
