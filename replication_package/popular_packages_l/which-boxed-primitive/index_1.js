// index.js
function identifyBoxedPrimitive(value) {
  if (value === null || typeof value !== 'object') {
    return null; // return null for non-object values and null itself
  }
  
  // Use Object.prototype.toString to get the internal class name
  const toStringTag = Object.prototype.toString.call(value);
  
  // Determine the type of boxed primitive based on the class name
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
      return undefined; // not a recognized boxed primitive
  }
}

module.exports = identifyBoxedPrimitive;

// test.js
const identifyBoxedPrimitive = require('./index');
const assert = require('assert');

// Test cases to validate the function behavior
assert.equal(identifyBoxedPrimitive(undefined), null);
assert.equal(identifyBoxedPrimitive(null), null);

assert.equal(identifyBoxedPrimitive(false), null);
assert.equal(identifyBoxedPrimitive(true), null);
assert.equal(identifyBoxedPrimitive(new Boolean(false)), 'Boolean');
assert.equal(identifyBoxedPrimitive(new Boolean(true)), 'Boolean');

assert.equal(identifyBoxedPrimitive(42), null);
assert.equal(identifyBoxedPrimitive(NaN), null);
assert.equal(identifyBoxedPrimitive(Infinity), null);
assert.equal(identifyBoxedPrimitive(new Number(42)), 'Number');
assert.equal(identifyBoxedPrimitive(new Number(NaN)), 'Number');
assert.equal(identifyBoxedPrimitive(new Number(Infinity)), 'Number');

assert.equal(identifyBoxedPrimitive(''), null);
assert.equal(identifyBoxedPrimitive('foo'), null);
assert.equal(identifyBoxedPrimitive(new String('')), 'String');
assert.equal(identifyBoxedPrimitive(new String('foo')), 'String');

assert.equal(identifyBoxedPrimitive(Symbol()), null);
assert.equal(identifyBoxedPrimitive(Object(Symbol())), 'Symbol');

assert.equal(identifyBoxedPrimitive(42n), null);
assert.equal(identifyBoxedPrimitive(Object(42n)), 'BigInt');

assert.equal(identifyBoxedPrimitive([]), undefined);
assert.equal(identifyBoxedPrimitive({}), undefined);
assert.equal(identifyBoxedPrimitive(/a/g), undefined);
assert.equal(identifyBoxedPrimitive(new RegExp('a', 'g')), undefined);
assert.equal(identifyBoxedPrimitive(new Date()), undefined);
assert.equal(identifyBoxedPrimitive(function () {}), undefined);
assert.equal(identifyBoxedPrimitive(function* () {}), undefined);
assert.equal(identifyBoxedPrimitive(x => x * x), undefined);
assert.equal(identifyBoxedPrimitive([]), undefined);

// package.json
{
  "name": "identify-boxed-primitive",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "devDependencies": {},
  "dependencies": {}
}
