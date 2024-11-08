'use strict';

const GetIntrinsic = require('es-abstract/GetIntrinsic');
const has = require('has');
const channel = require('side-channel')();

const $TypeError = GetIntrinsic('%TypeError%');

const SLOT = {
    assert: function (O, slot) {
        validateInput(O, slot);
        channel.assert(O);
    },
    get: function (O, slot) {
        validateInput(O, slot);
        const slots = channel.get(O);
        return slots && slots['$' + slot];
    },
    has: function (O, slot) {
        validateInput(O, slot);
        const slots = channel.get(O);
        return !!slots && has(slots, '$' + slot);
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
