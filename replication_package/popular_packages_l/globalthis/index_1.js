// File: index.js

'use strict';

const getGlobal = () => Function('return this')();

function detectGlobalObject() {
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

const defineProperty = (object, key, value) => {
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
};

function applyGlobalThisShim() {
    if (typeof globalThis === 'undefined') {
        defineProperty(detectGlobalObject(), 'globalThis', detectGlobalObject());
    }
    return globalThis;
}

module.exports = function() {
    return detectGlobalObject();
};

module.exports.shim = applyGlobalThisShim;

// File: polyfill.js

module.exports = require('./index.js');

// File: test.js

'use strict';

const assert = require('assert');
const globalThis = require('./index.js');

const getGlobalContext = () => Function('return this')();

// Test native or shimmed globalThis
assert.strictEqual(globalThis(), getGlobalContext());

// Test shimming
const shimmedGlobalThis = globalThis.shim();
assert.strictEqual(shimmedGlobalThis, getGlobalContext());
