'use strict';

const whichBoxedPrimitive = require('which-boxed-primitive'); 
const callBound = require('call-bind/callBound'); 
const hasSymbols = require('has-symbols')(); 
const hasBigInts = require('has-bigints')();

const stringToString = callBound('String.prototype.toString');
const numberValueOf = callBound('Number.prototype.valueOf');
const booleanValueOf = callBound('Boolean.prototype.valueOf');
const symbolValueOf = hasSymbols ? callBound('Symbol.prototype.valueOf') : null;
const bigIntValueOf = hasBigInts ? callBound('BigInt.prototype.valueOf') : null;

module.exports = function unboxPrimitive(value) {
    // Determine what type of boxed primitive type the value is, if any
    const which = whichBoxedPrimitive(value);

    // If it isn't a string, it's not a boxed-primitive or isn't recognized
    if (typeof which !== 'string') {
        throw new TypeError(which === null 
            ? 'value is an unboxed primitive' 
            : 'value is a non-boxed-primitive object');
    }

    // Use the corresponding method to unbox the specific boxed primitive type
    switch (which) {
        case 'String':
            return stringToString(value);

        case 'Number':
            return numberValueOf(value);

        case 'Boolean':
            return booleanValueOf(value);

        case 'Symbol':
            if (!hasSymbols) {
                throw new EvalError('somehow this environment does not have Symbols, but you have a boxed Symbol value. Please report this!');
            }
            return symbolValueOf(value);

        case 'BigInt':
            return bigIntValueOf(value);

        default:
            throw new RangeError('unknown boxed primitive found: ' + which);
    }
};
