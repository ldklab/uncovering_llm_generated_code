'use strict';

const GetIntrinsic = require('get-intrinsic');
const callBound = require('call-bind/callBound');

const $SyntaxError = require('es-errors/syntax');
const getGlobalSymbolDescription = GetIntrinsic('%Symbol.keyFor%', true);
const thisSymbolValue = callBound('%Symbol.prototype.valueOf%', true);
const symToStr = callBound('Symbol.prototype.toString', true);
const $strSlice = callBound('String.prototype.slice');

const getInferredName = require('./getInferredName');

module.exports = callBound('%Symbol.prototype.description%', true) || function getSymbolDescription(symbol) {
    // Check if the environment supports symbols
    if (!thisSymbolValue) {
        throw new $SyntaxError('Symbols are not supported in this environment');
    }

    // Attempt to retrieve internal symbol value
    const sym = thisSymbolValue(symbol);

    // Attempt to fetch an inferred symbol name
    if (getInferredName) {
        const name = getInferredName(sym);
        if (name !== '') {
            return name.slice(1, -1);
        }
    }

    // Attempt to get global symbol description
    let desc;
    if (getGlobalSymbolDescription) {
        desc = getGlobalSymbolDescription(sym);
        if (typeof desc === 'string') {
            return desc;
        }
    }

    // Fallback to slicing the symbol's toString value to extract description
    desc = $strSlice(symToStr(sym), 7, -1);
    if (desc) {
        return desc;
    }
};
