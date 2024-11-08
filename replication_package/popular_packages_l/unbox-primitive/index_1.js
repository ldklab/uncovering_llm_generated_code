const unboxPrimitive = require('unbox-primitive');
const assert = require('assert');

// Testing unboxing of various primitive objects
assert.strictEqual(unboxPrimitive(new Boolean(false)), false, 'Boolean unboxing failed');
assert.strictEqual(unboxPrimitive(new String('f')), 'f', 'String unboxing failed');
assert.strictEqual(unboxPrimitive(new Number(42)), 42, 'Number unboxing failed');

// Unbox a Symbol object
const s = Symbol();
assert.strictEqual(unboxPrimitive(Object(s)), s, 'Symbol unboxing failed');

// Unbox a BigInt object
assert.strictEqual(unboxPrimitive(Object(BigInt(42))), 42n, 'BigInt unboxing failed');
