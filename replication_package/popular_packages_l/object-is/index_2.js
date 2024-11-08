// object-is/index.js
function objectIs(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y; // Handle +0 and -0
  }
  return x !== x && y !== y; // Handle NaN
}

module.exports = objectIs;

// tests/test.js
const assert = require('assert');
const objectIs = require('../index');

describe('Object.is', function() {
  it('should handle normal equality', function() {
    assert.ok(objectIs(undefined, undefined));
    assert.ok(objectIs(null, null));
    assert.ok(objectIs(true, true));
    assert.ok(objectIs(false, false));
    assert.ok(objectIs('foo', 'foo'));
  });

  it('should handle object references', function() {
    const arr = [1, 2];
    assert.ok(objectIs(arr, arr));
    assert.strictEqual(objectIs(arr, [1, 2]), false);
  });

  it('should handle special numbers', function() {
    assert.ok(objectIs(0, 0));
    assert.ok(objectIs(-0, -0));
    assert.strictEqual(objectIs(0, -0), false);
    assert.ok(objectIs(NaN, NaN));
  });

  it('should handle infinities', function() {
    assert.ok(objectIs(Infinity, Infinity));
    assert.ok(objectIs(-Infinity, -Infinity));
  });
});

// package.json
{
  "name": "object-is",
  "version": "1.0.0",
  "description": "ES2015-compliant shim for Object.is",
  "main": "index.js",
  "scripts": {
    "test": "mocha tests/test.js"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/es-shims/object-is.git"
  },
  "keywords": ["Object.is", "ECMAScript", "shim", "polyfill"],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "mocha": "^6.0.0"
  }
}
