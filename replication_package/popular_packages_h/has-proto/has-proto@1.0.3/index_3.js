'use strict';

let testObj = {
  __proto__: null,
  foo: {}
};

const ObjectRef = Object;

/** @type {import('.')} */
module.exports = function checkProtoSupport() {
  // @ts-expect-error: Suppressing TypeScript error on inherited property
  return { __proto__: testObj }.foo === testObj.foo
    && !(testObj instanceof ObjectRef);
};
