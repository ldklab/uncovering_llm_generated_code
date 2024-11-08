// File: index.js

'use strict';

function getGlobal() {
    return Function('return this')();
}

function determineGlobalContext() {
    if (typeof globalThis !== 'undefined') {
        return globalThis;
    }
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    return getGlobal();
}

function addProperty(object, key, value) {
    if (Object.defineProperty) {
        Object.defineProperty(object, key, {
            configurable: true,
            enumerable: false,
            writable: true,
            value: value
        });
    } else {
        object[key] = value;
    }
}

function ensureGlobalThis() {
    if (typeof globalThis === 'undefined') {
        addProperty(determineGlobalContext(), 'globalThis', determineGlobalContext());
    }
    return globalThis;
}

module.exports = function() {
    return determineGlobalContext();
};

module.exports.shim = ensureGlobalThis;

// File: polyfill.js

module.exports = require('./index.js');

// File: test.js

'use strict';

const assert = require('assert');
const globalThisPolyfill = require('./index.js');

const retrieveGlobal = Function('return this');

// Test if globalThis or its shim is working correctly
assert.strictEqual(globalThisPolyfill(), retrieveGlobal());

// Test the shimming functionality
const shimmed = globalThisPolyfill.shim();
assert.strictEqual(shimmed, retrieveGlobal());
