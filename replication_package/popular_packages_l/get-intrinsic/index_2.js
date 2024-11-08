// get-intrinsic.js

'use strict';

// Import custom helper for method calling and fallback for Object.getPrototypeOf
const callBound = require('es-abstract/helpers/callBound');
const getProto = Object.getPrototypeOf || (obj => obj.__proto__);

// Cache to store intrinsic objects for fast retrieval
const INTRINSICS_CACHE = {};

// Main function to obtain intrinsic object given its name.
function GetIntrinsic(name, allowMissing = false) {
    const nameString = String(name); // Ensure the name is a string
    const parsed = parseIntrinsic(nameString); // Parse the intrinsic name

    const intrinsicBaseName = `%${parsed.base}%`;
    // Check cache first
    if (INTRINSICS_CACHE[intrinsicBaseName]) {
        return followPath(INTRINSICS_CACHE[intrinsicBaseName], parsed.path);
    }
    
    let intrinsic = fetchBaseIntrinsic(parsed.base);
    if (typeof intrinsic === 'undefined') {
        // If missing and not allowed, throw error
        if (!allowMissing) {
            throw new Error(`Intrinsic ${nameString} does not exist in this environment`);
        }
        return undefined; // Return undefined if missing is allowed
    }
    
    // Cache the intrinsic for future reference
    INTRINSICS_CACHE[intrinsicBaseName] = intrinsic;
    return followPath(intrinsic, parsed.path); // Apply the path to the base intrinsic
}

// Function to parse the name of the intrinsic into base and path components
function parseIntrinsic(name) {
    const [_, base, ...path] = name.split(/[%\[\].]+/).filter(Boolean);
    return { base, path };
}

// Function to directly fetch the base intrinsic object from global scope
function fetchBaseIntrinsic(base) {
    return base in globalThis ? globalThis[base] : undefined;
}

// Function to apply path onto base intrinsic and return the corresponding object
function followPath(base, path) {
    return path.reduce((obj, key) => obj ? obj[key] : undefined, base);
}

module.exports = GetIntrinsic;

// Mock implementation for `require` to demonstrate the function
function require(moduleName) {
    if (moduleName === 'get-intrinsic') return GetIntrinsic;
    throw new Error(`Module ${moduleName} not found`);
}

// Test assertions using `require`
const assert = require('assert');

// Demonstration of usage and testing of GetIntrinsic
try {
    // Static intrinsic retrieval and usage
    assert.equal(GetIntrinsic('%Math.pow%'), Math.pow);
    assert.equal(Math.pow(2, 3), 8);
    assert.equal(GetIntrinsic('%Math.pow%')(2, 3), 8);

    delete Math.pow; // Check if functionality persists without native definition
    assert.equal(GetIntrinsic('%Math.pow%')(2, 3), 8);

    // Instance method usage through intrinsic retrieval
    const array = [1];
    assert.equal(GetIntrinsic('%Array.prototype.push%'), Array.prototype.push);
    array.push(2);
    assert.deepStrictEqual(array, [1, 2]);

    GetIntrinsic('%Array.prototype.push%').call(array, 3);
    assert.deepStrictEqual(array, [1, 2, 3]);

    // Ensure functionality persists through intrinsic even if prototype method is deleted
    delete Array.prototype.push;
    GetIntrinsic('%Array.prototype.push%').call(array, 4);
    assert.deepStrictEqual(array, [1, 2, 3, 4]);

    // Simulate missing features scenario
    delete JSON.parse; // Remove intrinsic
    assert.throws(() => GetIntrinsic('%JSON.parse%')); // Expect error
    assert.equal(undefined, GetIntrinsic('%JSON.parse%', true)); // No throw, undefined returned

    console.log('All tests passed!'); // Success message
} catch (error) {
    console.error('Test failed', error); // Error handling
}
```