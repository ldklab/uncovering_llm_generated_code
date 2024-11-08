// internal-slot/index.js
'use strict';

const hasWeakMap = typeof WeakMap !== 'undefined';
const hasMap = typeof Map !== 'undefined';

function createStorage() {
    if (hasWeakMap) {
        return new WeakMap();
    } else if (hasMap) {
        return new Map();
    } else {
        return Object.create(null);
    }
}

const storage = createStorage();

function assertExists(obj, slotName) {
    if (!hasSlot(obj, slotName)) {
        throw new Error(`Assertion failed: slot "${slotName}" is missing`);
    }
}

function hasSlot(obj, slotName) {
    if (hasWeakMap || hasMap) {
        return storage.has(obj) && Object.prototype.hasOwnProperty.call(storage.get(obj), slotName);
    } else {
        return Object.prototype.hasOwnProperty.call(obj, '_internalSlots') && Object.prototype.hasOwnProperty.call(obj._internalSlots, slotName);
    }
}

function getSlot(obj, slotName) {
    if (hasWeakMap || hasMap) {
        return storage.has(obj) ? storage.get(obj)[slotName] : undefined;
    } else {
        return obj._internalSlots ? obj._internalSlots[slotName] : undefined;
    }
}

function setSlot(obj, slotName, value) {
    if (hasWeakMap || hasMap) {
        if (!storage.has(obj)) {
            storage.set(obj, Object.create(null));
        }
        storage.get(obj)[slotName] = value;
    } else {
        if (!obj._internalSlots) {
            obj._internalSlots = Object.create(null);
        }
        obj._internalSlots[slotName] = value;
    }
}

module.exports = {
    assert: assertExists,
    has: hasSlot,
    get: getSlot,
    set: setSlot
};

// test.js for running the examples in README
const SLOT = require('./index');
const assert = require('assert');

const obj = {};

// Test that an assertion error is thrown when the slot does not exist
assert.throws(() => { SLOT.assert(obj, 'foo'); });

// Check that 'foo' slot does not exist and returns undefined
assert.strictEqual(SLOT.has(obj, 'foo'), false);
assert.strictEqual(SLOT.get(obj, 'foo'), undefined);

// Set the 'foo' slot to value 42
SLOT.set(obj, 'foo', 42);

// Check that 'foo' slot now exists and has the correct value
assert.strictEqual(SLOT.has(obj, 'foo'), true);
assert.strictEqual(SLOT.get(obj, 'foo'), 42);

// Verify that no assertion error is thrown now
assert.doesNotThrow(() => { SLOT.assert(obj, 'foo'); });

console.log('All tests passed.');
