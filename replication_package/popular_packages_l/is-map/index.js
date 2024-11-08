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
    assert(!isMap(function () {}));
    assert(!isMap(null));
    assert(!isMap(function* () { yield 42; return Infinity; }));
    assert(!isMap(Symbol('foo')));
    assert(!isMap(1n));
    assert(!isMap(Object(1n)));
    assert(!isMap(new Set()));
    assert(!isMap(new WeakSet()));
    assert(!isMap(new WeakMap()));
  });

  it('should return true for Map instances', function() {
    assert(isMap(new Map()));
    class MyMap extends Map {}
    assert(isMap(new MyMap()));
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
