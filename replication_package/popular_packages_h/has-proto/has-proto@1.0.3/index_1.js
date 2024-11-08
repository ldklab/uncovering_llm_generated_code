'use strict';

const test = {
  __proto__: null,
  foo: {}
};

const ObjectPrototype = Object;

// Exported function to check prototype behavior
module.exports = function hasProto() {
  // Suppress TypeScript error for prototype check
  // Expecting `foo` to be inherited and confirming no prototype chain to Object
  // @ts-expect-error
  return { __proto__: test }.foo === test.foo
      && !(test instanceof ObjectPrototype);
};
