// index.js
function isRegex(value) {
    if (!value || typeof value !== 'object') {
        return false; // Return false if value is not an object
    }
    
    if (value instanceof RegExp) {
        return true; // Return true if value is a RegExp instance
    }

    // Fallback method using toString to handle cross-realm regex objects
    const toString = Object.prototype.toString;
    return toString.call(value) === '[object RegExp]'; // Check object's internal [[Class]]
}

module.exports = isRegex;

// test.js
const assert = require('assert');
const isRegex = require('./index');

// Test the isRegex function with various falsy and incorrect types
assert.notOk(isRegex(undefined)); // undefined is not a regex
assert.notOk(isRegex(null));      // null is not a regex
assert.notOk(isRegex(false));     // boolean false is not a regex
assert.notOk(isRegex(true));      // boolean true is not a regex
assert.notOk(isRegex(42));        // number is not a regex
assert.notOk(isRegex('foo'));     // string is not a regex
assert.notOk(isRegex(function () {})); // function is not a regex
assert.notOk(isRegex([]));        // array is not a regex
assert.notOk(isRegex({}));        // object is not a regex

// Test the isRegex function with actual regex instances
assert.ok(isRegex(/a/g));             // literal regex
assert.ok(isRegex(new RegExp('a', 'g'))); // RegExp object

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
