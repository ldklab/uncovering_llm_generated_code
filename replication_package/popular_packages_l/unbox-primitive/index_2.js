const unboxPrimitive = require('unbox-primitive');
const assert = require('assert');

assert.strictEqual(unboxPrimitive(new Boolean(false)), false);
assert.strictEqual(unboxPrimitive(new String('f')), 'f');
assert.strictEqual(unboxPrimitive(new Number(42)), 42);
const s = Symbol();
assert.strictEqual(unboxPrimitive(Object(s)), s);
assert.strictEqual(unboxPrimitive(BigInt(42)), BigInt(42));
