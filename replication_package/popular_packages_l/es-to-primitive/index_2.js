'use strict';

function toPrimitive(input, preferredType) {
    if (typeof input !== 'object' || input === null) {
        return input; // Return primitive as-is
    }
    
    const methodNames = preferredType === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
    
    for (const methodName of methodNames) {
        const method = input[methodName];
        if (typeof method === 'function') {
            const result = method.call(input);
            if (typeof result !== 'object' || result === null) {
                return result; // Return first valid primitive result
            }
        }
    }
    
    throw new TypeError("Cannot convert object to primitive value");
}

function toPrimitiveES5(input) {
    return toPrimitive(input); // ES5 logic
}

function toPrimitiveES2015(input) {
    return toPrimitive(input); // ES2015 logic
}

module.exports = toPrimitiveES2015;
module.exports.es5 = toPrimitiveES5;
module.exports.es2015 = toPrimitiveES2015;

// Example Usage
if (require.main === module) {
    const assert = require('assert');

    assert.strictEqual(toPrimitive(function () {}), String(function () {}));
    
    const date = new Date();
    assert.strictEqual(toPrimitive(date), String(date));
    
    assert.strictEqual(toPrimitive({ valueOf: function () { return 3; } }), 3);
    
    assert.strictEqual(toPrimitive(['a', 'b', 3]), String(['a', 'b', 3]));
    
    const sym = Symbol();
    assert.strictEqual(toPrimitive(Object(sym)), sym);
}