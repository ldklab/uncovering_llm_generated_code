// is-map/index.js
function isMap(value) {
  return Object.prototype.toString.call(value) === '[object Map]';
}

module.exports = isMap;

// is-map/test/test.js
const assert = require('assert');
const isMap = require('../index');

describe('is-Map tests', function() {
  it('should return false for non-Map values', function() {
    assert.strictEqual(isMap(function () {}), false);
    assert.strictEqual(isMap(null), false);
    assert.strictEqual(isMap(function* () { yield 42; return Infinity; }), false);
    assert.strictEqual(isMap(Symbol('foo')), false);
    assert.strictEqual(isMap(1n), false);
    assert.strictEqual(isMap(Object(1n)), false);
    assert.strictEqual(isMap(new Set()), false);
    assert.strictEqual(isMap(new WeakSet()), false);
    assert.strictEqual(isMap(new WeakMap()), false);
  });

  it('should return true for Map instances', function() {
    assert.strictEqual(isMap(new Map()), true);
    class MyMap extends Map {}
    assert.strictEqual(isMap(new MyMap()), true);
  });
});

// package.json
{
  "name": "is-map",
  "version": "1.0.0",
  "description": "Is this value a JS Map? This module works cross-realm/iframe, and despite ES6 @@toStringTag.",
  "main": "index.js",
  "scripts": {
    "test": "mocha"
  },
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "mocha": "^10.0.0"
  }
}
