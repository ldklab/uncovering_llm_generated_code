const unboxPrimitive = require('unbox-primitive');
const assert = require('assert');

assert.strictEqual(unboxPrimitive(new Boolean(false)), false);
assert.strictEqual(unboxPrimitive(new String('f')), 'f');
assert.strictEqual(unboxPrimitive(new Number(42)), 42);
const symbolValue = Symbol();
assert.strictEqual(unboxPrimitive(Object(symbolValue)), symbolValue);
assert.strictEqual(unboxPrimitive(Object(BigInt(42))), 42n);
