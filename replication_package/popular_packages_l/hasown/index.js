// hasown.js

'use strict';

// The hasOwn function takes an object and a property name. It returns true if the
// property is directly on the object, and false otherwise.
function hasOwn(obj, prop) {
  // Object.prototype.hasOwnProperty is used to check for own properties
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = hasOwn;

// test/hasown.test.js

'use strict';

const assert = require('assert');
const hasOwn = require('../hasown');

// Test cases for hasOwn function to validate its functionality
describe('hasOwn', function () {
  it('should return false for properties on prototype', function () {
    assert.strictEqual(hasOwn({}, 'toString'), false);
  });

  it('should return true for array own properties', function () {
    assert.strictEqual(hasOwn([], 'length'), true);
  });

  it('should return true for object own properties', function () {
    assert.strictEqual(hasOwn({ a: 42 }, 'a'), true);
  });

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
