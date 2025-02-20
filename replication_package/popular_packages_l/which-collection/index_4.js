// index.js
function whichCollection(value) {
  switch (Object.prototype.toString.call(value)) {
    case '[object Map]':
      return 'Map';
    case '[object Set]':
      return 'Set';
    case '[object WeakMap]':
      return 'WeakMap';
    case '[object WeakSet]':
      return 'WeakSet';
    default:
      return false;
  }
}

module.exports = whichCollection;

// test.js
const whichCollection = require('./index');
const assert = require('assert');

const nonCollectionValues = [
  undefined, null, false, true, [], {}, /a/g, new RegExp('a', 'g'), new Date(),
  42, NaN, Infinity, new Number(42), 42n, Object(42n), 'foo', Object('foo'),
  function () {}, function* () {}, x => x * x
];

nonCollectionValues.forEach((value) => {
  assert.equal(false, whichCollection(value));
});

assert.equal('Map', whichCollection(new Map()));
assert.equal('Set', whichCollection(new Set()));
assert.equal('WeakMap', whichCollection(new WeakMap()));
assert.equal('WeakSet', whichCollection(new WeakSet()));

// package.json
{
  "name": "which-collection",
  "version": "1.0.0",
  "description": "Identify whether a value is one of the JavaScript collection types: Map, Set, WeakMap, or WeakSet.",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "author": "Your Name",
  "license": "MIT"
}
