// has-proto/index.js

'use strict';

module.exports = function hasProto() {
  // Try to set '__proto__' on an object
  var testObj = {};
  try {
    testObj.__proto__ = {};
    return testObj.__proto__ === Object.prototype; // Check if fallback to Object.prototype worked
  } catch (e) {
    return false; // If an error occurs, __proto__ is not supported
  }
};

// has-proto/test.js

'use strict';

var assert = require('assert');
var hasProto = require('./');

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
