// hasown.js

'use strict';

// The hasOwn function checks if the provided property is a direct property of the object.
function hasOwn(obj, prop) {
  // Utilizes the hasOwnProperty method to determine if 'prop' is an own property of 'obj'.
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = hasOwn;

// test/hasown.test.js

'use strict';

const assert = require('assert');
const hasOwn = require('../hasown');

// Defines the test suite for the hasOwn function to ensure correct functionality.
describe('hasOwn', function () {

  // Verifies that 'hasOwn' returns false for properties found in the prototype chain.
  it('should return false for properties on prototype', function () {
    assert.strictEqual(hasOwn({}, 'toString'), false);
  });

  // Ensures 'hasOwn' correctly identifies own properties of arrays, like 'length'.
  it('should return true for array own properties', function () {
    assert.strictEqual(hasOwn([], 'length'), true);
  });

  // Tests that 'hasOwn' returns true for actual own properties of objects.
  it('should return true for object own properties', function () {
    assert.strictEqual(hasOwn({ a: 42 }, 'a'), true);
  });

  // Confirms 'hasOwn' returns false for properties not existing on the object.
  it('should return false for non-existent properties', function () {
    assert.strictEqual(hasOwn({ a: 42 }, 'b'), false);
  });
});

// package.json

{
  "name": "hasown",
  "version": "1.0.0",
  "description": "A robust, ES3 compatible, has own property predicate.",
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
