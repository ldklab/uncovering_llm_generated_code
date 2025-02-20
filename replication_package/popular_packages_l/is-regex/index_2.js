// index.js
function isRegex(value) {
    // Check if the value is non-null and an object
    if (!value || typeof value !== 'object') {
        return false;
    }

    // Check if the value is an instance of RegExp
    if (value instanceof RegExp) {
        return true;
    }

    // Use Object's toString method for cross-realm verification
    const toString = Object.prototype.toString;
    return toString.call(value) === '[object RegExp]';
}

module.exports = isRegex;

// test.js
const assert = require('assert');
const isRegex = require('./index');

// Validating non-regex inputs
assert.notOk(isRegex(undefined));
assert.notOk(isRegex(null));
assert.notOk(isRegex(false));
assert.notOk(isRegex(true));
assert.notOk(isRegex(42));
assert.notOk(isRegex('foo'));
assert.notOk(isRegex(function () {}));
assert.notOk(isRegex([]));
assert.notOk(isRegex({}));

// Validating regex inputs
assert.ok(isRegex(/a/g));
assert.ok(isRegex(new RegExp('a', 'g')));

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
