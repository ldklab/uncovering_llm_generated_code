'use strict';

const hasOwn = require('hasown');
const channel = require('side-channel')();

const $TypeError = require('es-errors/type');

const SLOT = {
  assert: function (O, slot) {
    validateInput(O, slot);
    channel.assert(O);
    
    if (!this.has(O, slot)) {
      throw new $TypeError(`'${slot}' is not present on 'O'`);
    }
  },
  get: function (O, slot) {
    validateInput(O, slot);
    
    const slots = channel.get(O);
    return slots ? slots['$' + slot] : undefined;
  },
  has: function (O, slot) {
    validateInput(O, slot);
    
    const slots = channel.get(O);
    return slots ? hasOwn(slots, '$' + slot) : false;
  },
  set: function (O, slot, V) {
    validateInput(O, slot);
    
    let slots = channel.get(O);
    if (!slots) {
      slots = {};
      channel.set(O, slots);
    }
    slots['$' + slot] = V;
  }
};

function validateInput(O, slot) {
  if (!O || (typeof O !== 'object' && typeof O !== 'function')) {
    throw new $TypeError('`O` is not an object');
  }
  if (typeof slot !== 'string') {
    throw new $TypeError('`slot` must be a string');
  }
}

if (Object.freeze) {
  Object.freeze(SLOT);
}

module.exports = SLOT;
