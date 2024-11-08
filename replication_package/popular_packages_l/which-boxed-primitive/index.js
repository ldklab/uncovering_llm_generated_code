// index.js
function whichBoxedPrimitive(value) {
  if (value === null || typeof value !== 'object') {
    return null; // handle the unboxed primitives and null
  }
  
  // Use `Object.prototype.toString` to determine the internal [[Class]]
  var toStringTag = Object.prototype.toString.call(value);
  
  switch (toStringTag) {
    case '[object Boolean]':
      return 'Boolean';
    case '[object Number]':
      return 'Number';
    case '[object String]':
      return 'String';
    case '[object Symbol]':
      return 'Symbol';
    case '[object BigInt]':
      return 'BigInt';
    default:
      return undefined; // not a boxed primitive
  }
}

module.exports = whichBoxedPrimitive;

// test.js
var whichBoxedPrimitive = require('./index');
var assert = require('assert');

assert.equal(whichBoxedPrimitive(undefined), null);
assert.equal(whichBoxedPrimitive(null), null);

assert.equal(whichBoxedPrimitive(false), null);
assert.equal(whichBoxedPrimitive(true), null);
assert.equal(whichBoxedPrimitive(new Boolean(false)), 'Boolean');
assert.equal(whichBoxedPrimitive(new Boolean(true)), 'Boolean');

assert.equal(whichBoxedPrimitive(42), null);
assert.equal(whichBoxedPrimitive(NaN), null);
assert.equal(whichBoxedPrimitive(Infinity), null);
assert.equal(whichBoxedPrimitive(new Number(42)), 'Number');
assert.equal(whichBoxedPrimitive(new Number(NaN)), 'Number');
assert.equal(whichBoxedPrimitive(new Number(Infinity)), 'Number');

assert.equal(whichBoxedPrimitive(''), null);
assert.equal(whichBoxedPrimitive('foo'), null);
assert.equal(whichBoxedPrimitive(new String('')), 'String');
assert.equal(whichBoxedPrimitive(new String('foo')), 'String');

assert.equal(whichBoxedPrimitive(Symbol()), null);
assert.equal(whichBoxedPrimitive(Object(Symbol())), 'Symbol');

assert.equal(whichBoxedPrimitive(42n), null);
assert.equal(whichBoxedPrimitive(Object(42n)), 'BigInt');

assert.equal(whichBoxedPrimitive([]), undefined);
assert.equal(whichBoxedPrimitive({}), undefined);
assert.equal(whichBoxedPrimitive(/a/g), undefined);
assert.equal(whichBoxedPrimitive(new RegExp('a', 'g')), undefined);
assert.equal(whichBoxedPrimitive(new Date()), undefined);
assert.equal(whichBoxedPrimitive(function () {}), undefined);
assert.equal(whichBoxedPrimitive(function* () {}), undefined);
assert.equal(whichBoxedPrimitive(x => x * x), undefined);
assert.equal(whichBoxedPrimitive([]), undefined);

// package.json
{
  "name": "which-boxed-primitive",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "devDependencies": {},
  "dependencies": {}
}
