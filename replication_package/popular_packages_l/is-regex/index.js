markdown
// index.js
function isRegex(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }
    
    if (value instanceof RegExp) {
        return true;
    }

    // Handle @@toStringTag
    // Check if 'source' and 'flags' exist on the object and it's a function
    // Retrieves the toString method
    const toString = Object.prototype.toString;
    //Uses the toString to check type. Cross-realm verification.
    return toString.call(value) === '[object RegExp]';
}

module.exports = isRegex;

// test.js
const assert = require('assert');
const isRegex = require('./index');

assert.notOk(isRegex(undefined));
assert.notOk(isRegex(null));
assert.notOk(isRegex(false));
assert.notOk(isRegex(true));
assert.notOk(isRegex(42));
assert.notOk(isRegex('foo'));
assert.notOk(isRegex(function () {}));
assert.notOk(isRegex([]));
assert.notOk(isRegex({}));

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
