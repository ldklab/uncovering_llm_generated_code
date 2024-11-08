'use strict';

const whichBoxedPrimitive = require('which-boxed-primitive');
const bind = require('function-bind');
const hasSymbols = require('has-symbols')();
const hasBigInts = require('has-bigints')();

const stringToString = bind.call(Function.call, String.prototype.toString);
const numberValueOf = bind.call(Function.call, Number.prototype.valueOf);
const booleanValueOf = bind.call(Function.call, Boolean.prototype.valueOf);
const symbolValueOf = hasSymbols ? bind.call(Function.call, Symbol.prototype.valueOf) : undefined;
const bigIntValueOf = hasBigInts ? bind.call(Function.call, BigInt.prototype.valueOf) : undefined;

function unboxPrimitive(value) {
    const which = whichBoxedPrimitive(value);
    if (typeof which !== 'string') {
        throw new TypeError(which === null ? 'value is an unboxed primitive' : 'value is a non-boxed-primitive object');
    }

    switch (which) {
        case 'String':
            return stringToString(value);
        case 'Number':
            return numberValueOf(value);
        case 'Boolean':
            return booleanValueOf(value);
        case 'Symbol':
            if (!hasSymbols) {
                throw new EvalError('Somehow this environment does not have Symbols, but you have a boxed Symbol value. Please report this!');
            }
            return symbolValueOf(value);
        case 'BigInt':
            return bigIntValueOf(value);
        default:
            throw new RangeError(`unknown boxed primitive found: ${which}`);
    }
}

module.exports = unboxPrimitive;
