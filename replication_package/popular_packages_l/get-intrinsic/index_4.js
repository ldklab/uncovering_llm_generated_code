// get-intrinsic.js

'use strict';

// Utility for bound function calls
const callBound = require('es-abstract/helpers/callBound');

// Polyfill getPrototypeOf for older environments
const getProto = Object.getPrototypeOf || (obj => obj.__proto__);

// Cache to store looked-up intrinsic objects
const INTRINSICS_CACHE = {};

// Function to retrieve an intrinsic object using a specific name
function GetIntrinsic(name, allowMissing = false) {
    const nameString = String(name);
    const parsed = parseIntrinsic(nameString);

    // Check cache first
    const intrinsicBaseName = `%${parsed.base}%`;
    if (INTRINSICS_CACHE[intrinsicBaseName]) {
        return applyPath(INTRINSICS_CACHE[intrinsicBaseName], parsed.path);
    }
    
    // Fetch intrinsic object from global scope
    let intrinsic = getBaseIntrinsic(parsed.base);
    if (typeof intrinsic === 'undefined') {
        if (!allowMissing) {
            throw new Error(`Intrinsic ${nameString} does not exist in this environment`);
        }
        return undefined;
    }
    
    // Cache the fetched intrinsic
    INTRINSICS_CACHE[intrinsicBaseName] = intrinsic;
    return applyPath(intrinsic, parsed.path);
}

// Parses an intrinsic name into its base and path components
function parseIntrinsic(name) {
    const [_, base, ...path] = name.split(/[%\[\].]+/).filter(Boolean);
    return { base, path };
}

// Retrieves the base intrinsic object from the global scope
function getBaseIntrinsic(base) {
    if (!(base in globalThis)) {
        return undefined;
    }
    return globalThis[base];
}

// Applies a property path to the base intrinsic object
function applyPath(base, path) {
    return path.reduce((obj, key) => {
        return obj ? obj[key] : undefined;
    }, base);
}

module.exports = GetIntrinsic;

// Mock implementation of require for demonstration purposes
function require(moduleName) {
    if (moduleName === 'es-abstract/helpers/callBound') {
        return function(f) { return f.bind(); };
    }
    if (moduleName === 'assert') {
        return assert;
    }
    if (moduleName === 'get-intrinsic') {
        return GetIntrinsic;
    }
    throw new Error(`Module ${moduleName} not found`);
}

// Mock implementation of assert module for testing purposes
const assert = {
    equal(actual, expected) {
        if (actual !== expected) {
            throw new Error(`Expected ${actual} to equal ${expected}`);
        }
    },
    deepStrictEqual(actual, expected) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`Expected ${JSON.stringify(actual)} to deep equal ${JSON.stringify(expected)}`);
        }
    },
    throws(fn) {
        try {
            fn();
            throw new Error(`Expected function to throw an error`);
        } catch (e) {
            if (e.message === 'Expected function to throw an error') {
                throw e;
            }
        }
    },
};

// Example usage and assertions
try {
    // Static methods
    assert.equal(GetIntrinsic('%Math.pow%'), Math.pow);
    assert.equal(Math.pow(2, 3), 8);
    assert.equal(GetIntrinsic('%Math.pow%')(2, 3), 8);

    delete Math.pow;
    assert.equal(GetIntrinsic('%Math.pow%')(2, 3), 8);

    // Instance methods
    const arr = [1];
    assert.equal(GetIntrinsic('%Array.prototype.push%'), Array.prototype.push);
    arr.push(2);
    assert.deepStrictEqual(arr, [1, 2]);

    GetIntrinsic('%Array.prototype.push%').call(arr, 3);
    assert.deepStrictEqual(arr, [1, 2, 3]);

    delete Array.prototype.push;
    GetIntrinsic('%Array.prototype.push%').call(arr, 4);
    assert.deepStrictEqual(arr, [1, 2, 3, 4]);

    // Missing features
    delete JSON.parse;
    assert.throws(() => GetIntrinsic('%JSON.parse%'));
    assert.equal(undefined, GetIntrinsic('%JSON.parse%', true));

    console.log('All tests passed!');
} catch (error) {
    console.error('Test failed', error);
}
```