'use strict';

function toPrimitive(input, preferredType) {
    if (typeof input !== 'object' || input === null) {
        return input; // Primitive values are returned as-is.
    }
    var methodNames = preferredType === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
    for (var i = 0; i < methodNames.length; i++) {
        var method = input[methodNames[i]];
        if (typeof method === 'function') {
            var result = method.call(input);
            if (typeof result !== 'object' || result === null) {
                return result;
            }
        }
    }
    throw new TypeError("Cannot convert object to primitive value");
}

function toPrimitiveES5(input) {
    return toPrimitive(input); // ES5 primarily uses the same logic.
}

function toPrimitiveES2015(input) {
    return toPrimitive(input); // ES2015 uses the same logic but may have additional types.
}

module.exports = toPrimitiveES2015; // Default export is the latest version.
module.exports.es5 = toPrimitiveES5;
module.exports.es2015 = toPrimitiveES2015;

// Example Usage
if (require.main === module) {
    const assert = require('assert');

    assert(toPrimitive(function () {}) === String(function () {}));
    
    const date = new Date();
    assert(toPrimitive(date) === String(date));
    
    assert(toPrimitive({ valueOf: function () { return 3; } }) === 3);
    
    assert(toPrimitive(['a', 'b', 3]) === String(['a', 'b', 3]));
    
    const sym = Symbol();
    assert(toPrimitive(Object(sym)) === sym);
}
