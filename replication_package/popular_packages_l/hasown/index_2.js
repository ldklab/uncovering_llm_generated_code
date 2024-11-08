// hasown.js

'use strict';

// hasOwn checks if an object has a specific property as its own (not inherited).
function hasOwn(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = hasOwn;

// test/hasown.test.js

'use strict';

const assert = require('assert');
const hasOwn = require('../hasown');

// Tests to confirm that hasOwn works correctly
describe('hasOwn', function () {
  it('should return false for inherited properties', function () {
    assert.strictEqual(hasOwn({}, 'toString'), false);
  });

  it('should return true for own array properties', function () {
    assert.strictEqual(hasOwn([], 'length'), true);
  });

  it('should return true for own object properties', function () {
    assert.strictEqual(hasOwn({ a: 42 }, 'a'), true);
  });

  it('should return false for properties that don\'t exist', function () {
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
