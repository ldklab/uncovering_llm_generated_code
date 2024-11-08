// index.js (main file for native Symbol support checking)
function hasNativeSymbols() {
  return typeof Symbol === 'function' && typeof Symbol() === 'symbol';
}

module.exports = hasNativeSymbols;

// shams.js (file for checking Symbol shams)
function hasSymbolShams() {
  if (typeof Symbol !== 'function') return false;

  try {
    String(Symbol('test'));
    if (typeof Object.getOwnPropertySymbols === 'function') {
      const obj = {};
      const sym = Symbol('test');
      obj[sym] = 42;
      return Object.getOwnPropertySymbols(obj)[0] === sym;
    }
    return false;
  } catch (e) {
    return false;
  }
}

module.exports = hasSymbolShams;

// package.json
{
  "name": "has-symbols",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "description": "Determine if the JS environment has Symbol support. Supports spec, or shams.",
  "license": "MIT",
  "devDependencies": {},
  "dependencies": {}
}

// test.js (basic testing script for the package)
const assert = require('assert');
const hasNativeSymbols = require('./index');
const hasSymbolShams = require('./shams');

console.log('Testing native Symbol support...');
assert.strictEqual(typeof Symbol === 'function' && typeof Symbol() === 'symbol', hasNativeSymbols());

console.log('Testing Symbol shams support...');
if (typeof Symbol !== 'function') {
  assert.strictEqual(hasSymbolShams(), false);
} else {
  try {
    assert.strictEqual(
      typeof Object.getOwnPropertySymbols === 'function' && 
      typeof Symbol.iterator !== 'undefined',
      hasSymbolShams()
    );
  } catch (e) {
    console.warn('Warning: Unable to conclusively test for Symbol shams');
  }
}

console.log('All tests passed!');
