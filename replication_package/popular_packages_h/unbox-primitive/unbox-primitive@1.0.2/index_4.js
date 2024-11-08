'use strict';

// Import required modules for checking boxed primitives and their functionalities
const whichBoxedPrimitive = require('which-boxed-primitive');
const callBound = require('call-bind/callBound');
const hasSymbols = require('has-symbols')();
const hasBigInts = require('has-bigints')();

// Create bound functions for retrieving primitive values from their boxed counterparts
const stringToString = callBound('String.prototype.toString');
const numberValueOf = callBound('Number.prototype.valueOf');
const booleanValueOf = callBound('Boolean.prototype.valueOf');
const symbolValueOf = hasSymbols && callBound('Symbol.prototype.valueOf');
const bigIntValueOf = hasBigInts && callBound('BigInt.prototype.valueOf');

// Function to unbox a primitive value from a boxed primitive object
module.exports = function unboxPrimitive(value) {
    // Determine the type of boxed primitive
    const which = whichBoxedPrimitive(value);

    // If 'which' is not a string, the value is not a valid boxed primitive.
    if (typeof which !== 'string') {
        throw new TypeError(
            which === null 
                ? 'value is an unboxed primitive' 
                : 'value is a non-boxed-primitive object'
        );
    }

    // Unbox and return the primitive value based on the identified type
    switch (which) {
        case 'String':
            return stringToString(value);
        case 'Number':
            return numberValueOf(value);
        case 'Boolean':
            return booleanValueOf(value);
        case 'Symbol':
            if (!hasSymbols) {
                throw new EvalError(
                    'somehow this environment does not have Symbols, but you have a boxed Symbol value. Please report this!'
                );
            }
            return symbolValueOf(value);
        case 'BigInt':
            return bigIntValueOf(value);
        default:
            throw new RangeError('unknown boxed primitive found: ' + which);
    }
};
