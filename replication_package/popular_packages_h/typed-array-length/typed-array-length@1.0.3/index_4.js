'use strict';

const forEach = require('foreach');
const callBind = require('call-bind');
const isTypedArray = require('is-typed-array');

const typedArrays = [
  'Float32Array',
  'Float64Array',
  'Int8Array',
  'Int16Array',
  'Int32Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Uint16Array',
  'Uint32Array',
  'BigInt64Array',
  'BigUint64Array'
];

const getters = {};
const hasProto = [].__proto__ === Array.prototype;
const gOPD = Object.getOwnPropertyDescriptor;
const oDP = Object.defineProperty;

if (gOPD) {
  const getLength = (x) => x.length;
  forEach(typedArrays, (typedArray) => {
    const constructor = global[typedArray];
    if (typeof constructor === 'function' || typeof constructor === 'object') {
      const Proto = constructor.prototype;
      let descriptor = gOPD(Proto, 'length');
      if (!descriptor && hasProto) {
        const superProto = Proto.__proto__;
        descriptor = gOPD(superProto, 'length');
      }

      if (descriptor?.get) {
        getters[typedArray] = callBind(descriptor.get);
      } else if (oDP) {
        const arr = new constructor(2);
        descriptor = gOPD(arr, 'length');
        if (descriptor?.configurable) {
          oDP(arr, 'length', { value: 3 });
        }
        if (arr.length === 2) {
          getters[typedArray] = getLength;
        }
      }
    }
  });
}

const tryTypedArrays = (value) => {
  let foundLength;
  forEach(getters, (getter) => {
    if (typeof foundLength !== 'number') {
      try {
        const length = getter(value);
        if (typeof length === 'number') {
          foundLength = length;
        }
      } catch (e) {}
    }
  });
  return foundLength;
};

module.exports = function typedArrayLength(value) {
  if (!isTypedArray(value)) {
    return false;
  }
  return tryTypedArrays(value);
};
