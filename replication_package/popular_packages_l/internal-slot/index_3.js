// internal-slot/index.js
'use strict';

const hasWeakMap = typeof WeakMap !== 'undefined';
const hasMap = typeof Map !== 'undefined';

// Function to create the appropriate storage mechanism based on environment support
function createStorage() {
    if (hasWeakMap) {
        return new WeakMap();
    } else if (hasMap) {
        return new Map();
    } else {
        return {}; // Fallback to a plain object if neither is supported
    }
}

// Initializes the storage
const storage = createStorage();

// Function to assert if a certain slot exists in storage for a given object
function assert(obj, slotName) {
    if (!has(obj, slotName)) {
        throw new Error(`Assertion failed: slot "${slotName}" is missing`);
    }
}

// Function to check if a slot exists for a given object
function has(obj, slotName) {
    if (hasWeakMap || hasMap) {
        return storage.has(obj) && Object.prototype.hasOwnProperty.call(storage.get(obj), slotName);
    } else {
        return Object.prototype.hasOwnProperty.call(obj, '_internalSlots') && 
               Object.prototype.hasOwnProperty.call(obj._internalSlots, slotName);
    }
}

// Function to retrieve the value of a slot for a given object
function get(obj, slotName) {
    if (hasWeakMap || hasMap) {
        return storage.has(obj) ? storage.get(obj)[slotName] : undefined;
    } else {
        return obj._internalSlots ? obj._internalSlots[slotName] : undefined;
    }
}

// Function to set the value of a slot for a given object
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

// Export functions for module
module.exports = {
    assert,
    has,
    get,
    set
};

// test.js for running the examples in README
const SLOT = require('./index');
const assert = require('assert');

const obj = {};

// Ensures "foo" slot does not exist on object and throws an error
assert.throws(() => { SLOT.assert(obj, 'foo'); });

// Confirms the "foo" slot is initially missing and returns undefined
assert.equal(SLOT.has(obj, 'foo'), false);
assert.equal(SLOT.get(obj, 'foo'), undefined);

// Sets the "foo" slot with a value of 42
SLOT.set(obj, 'foo', 42);

// Now "foo" slot should exist and return 42
assert.equal(SLOT.has(obj, 'foo'), true);
assert.equal(SLOT.get(obj, 'foo'), 42);

// Ensures "foo" slot exists and no error is thrown
assert.doesNotThrow(() => { SLOT.assert(obj, 'foo'); });

console.log('All tests passed.');
