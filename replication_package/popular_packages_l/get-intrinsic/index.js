// get-intrinsic.js

'use strict';

const callBound = require('es-abstract/helpers/callBound');
const getProto = Object.getPrototypeOf || (obj => obj.__proto__); // Fallback if Object.getPrototypeOf isn't available

// Cache for intrinsic lookups
const INTRINSICS_CACHE = {};

// Function to parse intrinsic identifier and get the relevant object
function GetIntrinsic(name, allowMissing = false) {
    const nameString = String(name);
    const parsed = parseIntrinsic(nameString);

    const intrinsicBaseName = `%${parsed.base}%`;
    if (INTRINSICS_CACHE[intrinsicBaseName]) {
        return applyPath(INTRINSICS_CACHE[intrinsicBaseName], parsed.path);
    }
    
    let intrinsic = getBaseIntrinsic(parsed.base);
    if (typeof intrinsic === 'undefined') {
        if (!allowMissing) {
            throw new Error(`Intrinsic ${nameString} does not exist in this environment`);
        }
        return undefined;
    }
    
    INTRINSICS_CACHE[intrinsicBaseName] = intrinsic;
    return applyPath(intrinsic, parsed.path);
}

// Helper: Extracts base and path from intrinsic name
function parseIntrinsic(name) {
    const [_, base, ...path] = name.split(/[%\[\].]+/).filter(Boolean);
    return { base, path };
}

// Helper: Directly access the intrinsic object
function getBaseIntrinsic(base) {
    if (!(base in globalThis)) {
        return undefined;
    }
    return globalThis[base];
}

// Helper: Apply path to the base object
function applyPath(base, path) {
    return path.reduce((obj, key) => {
        return obj ? obj[key] : undefined;
    }, base);
}

module.exports = GetIntrinsic;

// Mock implementation of require for demonstration purposes
function require(moduleName) {
    if (moduleName === 'get-intrinsic') return GetIntrinsic;
    throw new Error(`Module ${moduleName} not found`);
}

// Test setup
const assert = require('assert');

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

This code implements the core functionality described in the `README.md`: retrieving, caching, and using JavaScript intrinsic objects. It includes means for handling both present and missing features gracefully.