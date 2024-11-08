var unboxPrimitive = require('unbox-primitive');
var assert = require('assert');

assert.equal(unboxPrimitive(new Boolean(false)), false);
assert.equal(unboxPrimitive(new String('f')), 'f');
assert.equal(unboxPrimitive(new Number(42)), 42);
const s = Symbol();
assert.equal(unboxPrimitive(Object(s)), s);
assert.equal(unboxPrimitive(new BigInt(42)), 42n);
