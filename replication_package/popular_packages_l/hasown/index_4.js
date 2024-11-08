// hasown.js

'use strict';

// Define a function to check if a property is owned by the object.
function hasOwn(obj, prop) {
  // Use 'hasOwnProperty' method from Object prototype to determine ownership.
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

// Export the function for use in other modules.
module.exports = hasOwn;

// test/hasown.test.js

'use strict';

const assert = require('assert');
const hasOwn = require('../hasown');

// Group tests under the 'hasOwn' name
describe('hasOwn', function () {

  // Check that prototype properties are not considered own properties
  it('should return false for properties on prototype', function () {
    assert.strictEqual(hasOwn({}, 'toString'), false);
  });

  // Validate that 'length' is recognized as an own property of arrays
  it('should return true for array own properties', function () {
    assert.strictEqual(hasOwn([], 'length'), true);
  });

  // Ensure that an object's property is correctly identified as own
  it('should return true for object own properties', function () {
    assert.strictEqual(hasOwn({ a: 42 }, 'a'), true);
  });

  // Check that non-existent properties are not falsely identified as own
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
