// has-proto/index.js

'use strict';

module.exports = function hasProto() {
  // Attempt to change the '__proto__' property of a test object
  var testObj = {};
  try {
    testObj.__proto__ = {};
    // Return true if changing '__proto__' doesn't fallback to the default Object.prototype
    return testObj.__proto__ !== Object.prototype;
  } catch (e) {
    // If an error is thrown, it means '__proto__' is not supported
    return false;
  }
};

// has-proto/test.js

'use strict';

var assert = require('assert');
var hasProto = require('./');

// Assert that hasProto() returns a boolean value
assert.equal(typeof hasProto(), 'boolean', 'hasProto should return a boolean');

// has-proto/package.json

{
  "name": "has-proto",
  "version": "1.0.0",
  "description": "Detect if the environment supports setting [[Prototype]] via __proto__",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "keywords": [
    "__proto__",
    "prototype",
    "javascript",
    "feature-detection"
  ],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "assert": "^1.5.0"
  }
}
