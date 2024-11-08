'use strict';

// Converts an object to a primitive value, prioritizing either a string or default number preference.
function toPrimitive(input, preferredType) {
    if (typeof input !== 'object' || input === null) {
        return input; // Return non-object as-is since it's already primitive.
    }
    // Determine the order of methods to call based on preference.
    const methodNames = preferredType === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
    for (const methodName of methodNames) {
        const method = input[methodName];
        if (typeof method === 'function') {
            const result = method.call(input);
            // Return result if it is primitive.
            if (typeof result !== 'object' || result === null) {
                return result;
            }
        }
    }
    throw new TypeError("Cannot convert object to primitive value");
}

// The ES5 version uses the same conversion logic as toPrimitive.
function toPrimitiveES5(input) {
    return toPrimitive(input);
}

// The ES2015 version also uses the same logic. It is provided for API parity.
function toPrimitiveES2015(input) {
    return toPrimitive(input);
}

// Export the ES2015 function as the default and provide access to both versions.
module.exports = toPrimitiveES2015;
module.exports.es5 = toPrimitiveES5;
module.exports.es2015 = toPrimitiveES2015;

// Run example usage only if the script is executed directly.
if (require.main === module) {
    const assert = require('assert');

    // Function should convert to string.
    assert(toPrimitive(function () {}) === String(function () {}));
    
    // Date objects should convert to string by default.
    const date = new Date();
    assert(toPrimitive(date) === String(date));
    
    // Objects with a valueOf method returning a primitive should return that primitive.
    assert(toPrimitive({ valueOf: function () { return 3; } }) === 3);
    
    // Arrays should convert to their string representation.
    assert(toPrimitive(['a', 'b', 3]) === String(['a', 'b', 3]));
    
    // Wrapped symbols should convert to the primitive symbol.
    const sym = Symbol();
    assert(toPrimitive(Object(sym)) === sym);
}
