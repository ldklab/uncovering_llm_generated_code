'use strict';

const whichBoxedPrimitive = require('which-boxed-primitive');
const { call } = require('function-bind');
const hasSymbols = require('has-symbols')();
const hasBigInts = require('has-bigints')();

const toString = call.bind(String.prototype.toString);
const numberValueOf = call.bind(Number.prototype.valueOf);
const booleanValueOf = call.bind(Boolean.prototype.valueOf);
const symbolValueOf = hasSymbols ? call.bind(Symbol.prototype.valueOf) : null;
const bigIntValueOf = hasBigInts ? call.bind(BigInt.prototype.valueOf) : null;

module.exports = function unboxPrimitive(value) {
    const type = whichBoxedPrimitive(value);
    if (typeof type !== 'string') {
        throw new TypeError(type === null ? 'value is an unboxed primitive' : 'value is a non-boxed-primitive object');
    }

    switch (type) {
        case 'String':
            return toString(value);
        case 'Number':
            return numberValueOf(value);
        case 'Boolean':
            return booleanValueOf(value);
        case 'Symbol':
            if (!hasSymbols) {
                throw new EvalError('Environment lacks Symbols, yet a boxed Symbol is present. Please report this!');
            }
            return symbolValueOf(value);
        case 'BigInt':
            return bigIntValueOf(value);
        default:
            throw new RangeError('Unknown boxed primitive: ' + type);
    }
};
