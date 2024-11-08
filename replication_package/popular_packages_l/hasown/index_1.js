// hasown.js

'use strict';

// Function to check if a specified property is an own property of the given object
function hasOwn(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = hasOwn;

// test/hasown.test.js

'use strict';

const assert = require('assert');
const hasOwn = require('../hasown');

// Unit tests for the 'hasOwn' function
describe('hasOwn', function () {
  it('should return false for properties inherited from the prototype', function () {
    assert.strictEqual(hasOwn({}, 'toString'), false);
  });

  it('should return true for existing array own properties', function () {
    assert.strictEqual(hasOwn([], 'length'), true);
  });

  it('should return true for existing object own properties', function () {
    assert.strictEqual(hasOwn({ a: 42 }, 'a'), true);
  });

  it('should return false for non-existent properties on the object', function () {
    assert.strictEqual(hasOwn({ a: 42 }, 'b'), false);
  });
});

// package.json

{
  "name": "hasown",
  "version": "1.0.0",
  "description": "A robust, ES3 compatible, has own property check utility.",
  "main": "hasown.js",
  "scripts": {
    "test": "mocha"
  },
  "keywords": [
    "object",
    "property",
    "hasOwnProperty"
  ],
  "author": "Author Name",
  "license": "MIT",
  "devDependencies": {
    "mocha": "^10.0.0"
  }
}
