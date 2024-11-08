'use strict';

function convertToPrimitive(value, preferredType) {
    if (typeof value !== 'object' || value === null) {
        return value; // Return primitive values directly.
    }
    
    const conversionMethods = preferredType === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
    
    for (const methodName of conversionMethods) {
        const method = value[methodName];
        if (typeof method === 'function') {
            const result = method.call(value);
            if (typeof result !== 'object' || result === null) {
                return result;
            }
        }
    }
    
    throw new TypeError("Cannot convert object to primitive value");
}

function convertToPrimitiveES5(value) {
    return convertToPrimitive(value); // Utilize the base conversion logic for ES5.
}

function convertToPrimitiveES2015(value) {
    return convertToPrimitive(value); // Use similar logic for ES2015.
}

module.exports = convertToPrimitiveES2015; // Default export as ES2015 standard.
module.exports.es5 = convertToPrimitiveES5;
module.exports.es2015 = convertToPrimitiveES2015;

// Example Usage and Tests
if (require.main === module) {
    const assert = require('assert');

    assert.strictEqual(convertToPrimitive(function () {}), String(function () {}));
    
    const date = new Date();
    assert.strictEqual(convertToPrimitive(date), String(date));
    
    assert.strictEqual(convertToPrimitive({ valueOf: function () { return 3; } }), 3);
    
    assert.strictEqual(convertToPrimitive(['a', 'b', 3]), String(['a', 'b', 3]));
    
    const symbol = Symbol();
    assert.strictEqual(convertToPrimitive(Object(symbol)), symbol);
}
