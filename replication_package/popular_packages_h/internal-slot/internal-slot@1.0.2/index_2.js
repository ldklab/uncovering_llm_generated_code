'use strict';

const GetIntrinsic = require('es-abstract/GetIntrinsic');
const hasOwnProp = require('has');
const sideChannel = require('side-channel')();

const $TypeError = GetIntrinsic('%TypeError%');

const SLOT = {
  assert: (O, slot) => {
    validateInputs(O, slot);
    sideChannel.assert(O);
  },
  get: (O, slot) => {
    validateInputs(O, slot);
    const slots = sideChannel.get(O);
    return slots ? slots[`$${slot}`] : undefined;
  },
  has: (O, slot) => {
    validateInputs(O, slot);
    const slots = sideChannel.get(O);
    return slots ? hasOwnProp(slots, `$${slot}`) : false;
  },
  set: (O, slot, V) => {
    validateInputs(O, slot);
    let slots = sideChannel.get(O);
    if (!slots) {
      slots = {};
      sideChannel.set(O, slots);
    }
    slots[`$${slot}`] = V;
  }
};

const validateInputs = (O, slot) => {
  if (!O || (typeof O !== 'object' && typeof O !== 'function')) {
    throw new $TypeError('`O` is not an object');
  }
  if (typeof slot !== 'string') {
    throw new $TypeError('`slot` must be a string');
  }
};

if (Object.freeze) {
  Object.freeze(SLOT);
}

module.exports = SLOT;
