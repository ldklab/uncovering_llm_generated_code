// internal-slot/index.js
'use strict';

var hasWeakMap = typeof WeakMap !== 'undefined';
var hasMap = typeof Map !== 'undefined';

function createStorage() {
    if (hasWeakMap) {
        return new WeakMap();
    } else if (hasMap) {
        return new Map();
    } else {
        return new Object();
    }
}

var storage = createStorage();

function assert(obj, slotName) {
    if (!has(obj, slotName)) {
        throw new Error('Assertion failed: slot "' + slotName + '" is missing');
    }
}

function has(obj, slotName) {
    if (hasWeakMap || hasMap) {
        return storage.has(obj) && storage.get(obj).hasOwnProperty(slotName);
    } else {
        return obj.hasOwnProperty('_internalSlots') && obj._internalSlots.hasOwnProperty(slotName);
    }
}

function get(obj, slotName) {
    if (hasWeakMap || hasMap) {
        if (storage.has(obj)) {
            return storage.get(obj)[slotName];
        }
        return undefined;
    } else {
        return obj._internalSlots ? obj._internalSlots[slotName] : undefined;
    }
}

function set(obj, slotName, value) {
    if (hasWeakMap || hasMap) {
        if (!storage.has(obj)) {
            storage.set(obj, {});
        }
        storage.get(obj)[slotName] = value;
    } else {
        if (!obj._internalSlots) {
            obj._internalSlots = {};
        }
        obj._internalSlots[slotName] = value;
    }
}

module.exports = {
    assert: assert,
    has: has,
    get: get,
    set: set
};

// test.js for running the examples in README
const SLOT = require('./index');
const assert = require('assert');

const o = {};

assert.throws(function() { SLOT.assert(o, 'foo'); });

assert.equal(SLOT.has(o, 'foo'), false);
assert.equal(SLOT.get(o, 'foo'), undefined);

SLOT.set(o, 'foo', 42);

assert.equal(SLOT.has(o, 'foo'), true);
assert.equal(SLOT.get(o, 'foo'), 42);

assert.doesNotThrow(function() { SLOT.assert(o, 'foo'); });

console.log('All tests passed.');
