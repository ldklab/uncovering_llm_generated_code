// has-proto/index.js

'use strict';

module.exports = function canSetProto() {
  // Attempt to assign '__proto__' on a sample object
  const sampleObject = {};
  try {
    // Set '__proto__' to an empty object
    sampleObject.__proto__ = {};
    // Verify if '__proto__' property can be set and behaves as expected
    return sampleObject.__proto__ === Object.prototype;
  } catch (error) {
    // If an exception occurs, '__proto__' property setting is not supported
    return false;
  }
};

// has-proto/test.js

'use strict';

const assert = require('assert');
const canSetProto = require('./');

assert.strictEqual(typeof canSetProto(), 'boolean', 'canSetProto should return a boolean');

// has-proto/package.json

{
  "name": "can-set-proto",
  "version": "1.0.0",
  "description": "Detect if the JavaScript environment supports setting [[Prototype]] using __proto__",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "keywords": [
    "__proto__",
    "prototype",
    "feature-detection",
    "javascript"
  ],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "assert": "^1.5.0"
  }
}
