// internal-slot/index.js
'use strict';

// Check for the availability of WeakMap and Map.
const hasWeakMap = typeof WeakMap !== 'undefined';
const hasMap = typeof Map !== 'undefined';

// Create a storage mechanism that uses WeakMap if available, otherwise Map or fallback to an Object.
function createStorage() {
    if (hasWeakMap) {
        return new WeakMap();
    } else if (hasMap) {
        return new Map();
    } else {
        return {};  // Use a plain object if neither WeakMap nor Map are available.
    }
}

const storage = createStorage();

// Ensure that a given slot exists on an object, else throw an error.
function assert(obj, slotName) {
    if (!has(obj, slotName)) {
        throw new Error(`Assertion failed: slot "${slotName}" is missing`);
    }
}

// Check whether an object has a specific slot.
function has(obj, slotName) {
    if (hasWeakMap || hasMap) {
        return storage.has(obj) && storage.get(obj).hasOwnProperty(slotName);
    } else {
        return obj.hasOwnProperty('_internalSlots') && obj._internalSlots.hasOwnProperty(slotName);
    }
}

// Retrieve the value of a slot from an object.
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

// Set the value of a slot on an object.
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

// Export the assert, has, get, and set functions.
module.exports = {
    assert,
    has,
    get,
    set
};

// test.js demonstrating usage of the exported functions.
const SLOT = require('./index');
const assert = require('assert');

// Create an empty object to test slot functionality.
const o = {};

// Test the assert function to ensure it throws when the slot is missing.
assert.throws(() => { SLOT.assert(o, 'foo'); });

// Check initial absence of the 'foo' slot.
assert.strictEqual(SLOT.has(o, 'foo'), false);
assert.strictEqual(SLOT.get(o, 'foo'), undefined);

// Set a value for the 'foo' slot.
SLOT.set(o, 'foo', 42);

// Validate that the 'foo' slot now exists and holds the correct value.
assert.strictEqual(SLOT.has(o, 'foo'), true);
assert.strictEqual(SLOT.get(o, 'foo'), 42);

// Ensure the assert function does not throw now that the slot is set.
assert.doesNotThrow(() => { SLOT.assert(o, 'foo'); });

console.log('All tests passed.');
