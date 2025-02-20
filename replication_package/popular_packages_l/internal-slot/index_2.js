// internal-slot/index.js
'use strict';

// Check if the current environment supports WeakMap and Map
const isWeakMapSupported = typeof WeakMap !== 'undefined';
const isMapSupported = typeof Map !== 'undefined';

// Function to create storage using WeakMap, Map, or plain Object
function createStorage() {
    if (isWeakMapSupported) {
        return new WeakMap();
    } else if (isMapSupported) {
        return new Map();
    } else {
        return {};
    }
}

// Create storage instance
const storage = createStorage();

// Function to assert the existence of a slot on an object
function assertSlotExists(obj, slotName) {
    if (!hasSlot(obj, slotName)) {
        throw new Error(`Assertion failed: slot "${slotName}" is missing`);
    }
}

// Function to check if a slot exists on an object
function hasSlot(obj, slotName) {
    if (isWeakMapSupported || isMapSupported) {
        return storage.has(obj) && storage.get(obj).hasOwnProperty(slotName);
    } else {
        return obj.hasOwnProperty('_internalSlots') && obj._internalSlots.hasOwnProperty(slotName);
    }
}

// Function to get the value of a slot from an object
function getSlot(obj, slotName) {
    if (isWeakMapSupported || isMapSupported) {
        if (storage.has(obj)) {
            return storage.get(obj)[slotName];
        }
        return undefined;
    } else {
        return obj._internalSlots ? obj._internalSlots[slotName] : undefined;
    }
}

// Function to set a value on a slot for an object
function setSlot(obj, slotName, value) {
    if (isWeakMapSupported || isMapSupported) {
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

// Exporting the functions for external usage
module.exports = {
    assert: assertSlotExists,
    has: hasSlot,
    get: getSlot,
    set: setSlot
};

// test.js for running the examples in README
const SLOT = require('./index');
const assert = require('assert');

// Create an empty object to test slot functionality
const o = {};

// Test assertions for slot presence and absence
assert.throws(() => { SLOT.assert(o, 'foo'); });

assert.strictEqual(SLOT.has(o, 'foo'), false);
assert.strictEqual(SLOT.get(o, 'foo'), undefined);

// Set a slot and verify its existence and value
SLOT.set(o, 'foo', 42);

assert.strictEqual(SLOT.has(o, 'foo'), true);
assert.strictEqual(SLOT.get(o, 'foo'), 42);

// After setting, the assertion for slot existence should not throw
assert.doesNotThrow(() => { SLOT.assert(o, 'foo'); });

// Print confirmation of test success
console.log('All tests passed.');
