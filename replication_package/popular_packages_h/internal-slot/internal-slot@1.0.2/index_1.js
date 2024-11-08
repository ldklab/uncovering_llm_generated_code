'use strict';

const GetIntrinsic = require('es-abstract/GetIntrinsic');
const has = require('has');
const channel = require('side-channel')();

const $TypeError = GetIntrinsic('%TypeError%');

const SLOT = {
    assert(O, slot) {
        validateInputs(O, slot);
        channel.assert(O);
    },
    get(O, slot) {
        validateInputs(O, slot);
        const slots = channel.get(O);
        return slots ? slots[`$${slot}`] : undefined;
    },
    has(O, slot) {
        validateInputs(O, slot);
        const slots = channel.get(O);
        return !!(slots && has(slots, `$${slot}`));
    },
    set(O, slot, V) {
        validateInputs(O, slot);
        let slots = channel.get(O);
        if (!slots) {
            slots = {};
            channel.set(O, slots);
        }
        slots[`$${slot}`] = V;
    }
};

function validateInputs(O, slot) {
    if (!O || (typeof O !== 'object' && typeof O !== 'function')) {
        throw new $TypeError('`O` is not an object');
    }
    if (typeof slot !== 'string') {
        throw new $TypeError('`slot` must be a string');
    }
}

if (typeof Object.freeze === 'function') {
    Object.freeze(SLOT);
}

module.exports = SLOT;
