// has-proto/index.js

'use strict';

module.exports = function detectProtoSupport() {
  // Attempt to assign '__proto__' to an object's prototype
  const dummyObj = {};
  try {
    dummyObj.__proto__ = {};
    return dummyObj.__proto__ === Object.prototype; // Verify if it reverts to Object.prototype
  } catch (error) {
    return false; // Return false if an error indicates lack of support for __proto__
  }
};

// has-proto/test.js

'use strict';

const assert = require('assert');
const detectProtoSupport = require('./');

assert.strictEqual(typeof detectProtoSupport(), 'boolean', 'detectProtoSupport should return a boolean value');

// has-proto/package.json

{
  "name": "has-proto",
  "version": "1.0.0",
  "description": "Check environment support for setting [[Prototype]] using __proto__",
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
