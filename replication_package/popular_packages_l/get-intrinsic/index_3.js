// Refactored GetIntrinsic implementation

'use strict';

const getProto = Object.getPrototypeOf || (obj => obj.__proto__);
const INTRINSICS_CACHE = {};

// Function to retrieve intrinsic objects
function GetIntrinsic(name, allowMissing = false) {
    const parsed = parseIntrinsic(String(name));
    const baseName = `%${parsed.base}%`;
    
    if (INTRINSICS_CACHE[baseName]) {
        return followPath(INTRINSICS_CACHE[baseName], parsed.path);
    }
    
    const baseIntrinsic = getGlobalIntrinsic(parsed.base);
    if (baseIntrinsic === undefined && !allowMissing) {
        throw new Error(`Intrinsic ${name} does not exist in this environment`);
    }
    
    INTRINSICS_CACHE[baseName] = baseIntrinsic;
    return followPath(baseIntrinsic, parsed.path);
}

// Parse the intrinsic name to extract base and path
function parseIntrinsic(name) {
    const [, base, ...path] = name.split(/[%\[\].]+/).filter(Boolean);
    return { base, path };
}

// Retrieve the intrinsic base object from global scope
function getGlobalIntrinsic(base) {
    return globalThis.hasOwnProperty(base) ? globalThis[base] : undefined;
}

// Navigate through properties using the path array
function followPath(base, path) {
    return path.reduce((obj, prop) => obj ? obj[prop] : undefined, base);
}

// Export the GetIntrinsic function
module.exports = GetIntrinsic;

// Mock require for demonstration purposes
function require(moduleName) {
    if (moduleName === 'get-intrinsic') return GetIntrinsic;
    throw new Error(`Module ${moduleName} not found`);
}

// Testing setup
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
