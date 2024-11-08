'use strict';

var whichBoxedPrimitive = require('which-boxed-primitive');
var bind = require('function-bind');
var hasSymbols = require('has-symbols')();
var hasBigInts = require('has-bigints')();

// Create bound versions of the `toString` and `valueOf` methods for different primitive object wrappers
var boundStringToString = bind(Function.call, String.prototype.toString);
var boundNumberValueOf = bind(Function.call, Number.prototype.valueOf);
var boundBooleanValueOf = bind(Function.call, Boolean.prototype.valueOf);
var boundSymbolValueOf = hasSymbols ? bind(Function.call, Symbol.prototype.valueOf) : null;
var boundBigIntValueOf = hasBigInts ? bind(Function.call, BigInt.prototype.valueOf) : null;

module.exports = function unboxPrimitive(value) {
    // Determine which type of boxed primitive the value is
    var primitiveType = whichBoxedPrimitive(value);
    if (typeof primitiveType !== 'string') {
        // If we don't get a string back, handle potential errors
        throw new TypeError(primitiveType === null 
            ? 'value is an unboxed primitive' 
            : 'value is a non-boxed-primitive object');
    }

    // Unbox based on the type of boxed primitive
    switch (primitiveType) {
        case 'String':
            return boundStringToString(value);
        case 'Number':
            return boundNumberValueOf(value);
        case 'Boolean':
            return boundBooleanValueOf(value);
        case 'Symbol':
            if (!hasSymbols) {
                throw new EvalError('somehow this environment does not have Symbols, but you have a boxed Symbol value. Please report this!');
            }
            return boundSymbolValueOf(value);
        case 'BigInt':
            return boundBigIntValueOf(value);
        default:
            throw new RangeError('unknown boxed primitive found: ' + primitiveType);
    }
};
