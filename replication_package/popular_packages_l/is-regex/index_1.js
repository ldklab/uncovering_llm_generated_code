markdown
// index.js
function isRegex(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }

    if (value instanceof RegExp) {
        return true;
    }

    const toString = Object.prototype.toString;
    return toString.call(value) === '[object RegExp]';
}

module.exports = isRegex;

// test.js
const assert = require('assert');
const isRegex = require('./index');

assert.strictEqual(isRegex(undefined), false);
assert.strictEqual(isRegex(null), false);
assert.strictEqual(isRegex(false), false);
assert.strictEqual(isRegex(true), false);
assert.strictEqual(isRegex(42), false);
assert.strictEqual(isRegex('foo'), false);
assert.strictEqual(isRegex(function () {}), false);
assert.strictEqual(isRegex([]), false);
assert.strictEqual(isRegex({}), false);

assert.strictEqual(isRegex(/a/g), true);
assert.strictEqual(isRegex(new RegExp('a', 'g')), true);

console.log("All tests passed!");

// package.json
{
  "name": "is-regex",
  "version": "1.0.0",
  "description": "Check if a value is a JS regex",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "assert": "^2.0.0"
  }
}
