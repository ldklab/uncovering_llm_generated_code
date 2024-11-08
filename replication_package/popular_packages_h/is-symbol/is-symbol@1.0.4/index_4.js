'use strict';

const toStr = Object.prototype.toString;
const hasSymbols = require('has-symbols')();

function isRealSymbolObject(value) {
    const symStringRegex = /^Symbol\(.*\)$/;
    if (typeof value.valueOf() !== 'symbol') {
        return false;
    }
    return symStringRegex.test(Symbol.prototype.toString.call(value));
}

function isSymbol(value) {
    if (hasSymbols) {
        if (typeof value === 'symbol') {
            return true;
        }
        if (toStr.call(value) !== '[object Symbol]') {
            return false;
        }
        try {
            return isRealSymbolObject(value);
        } catch (e) {
            return false;
        }
    } else {
        // Symbol is not supported in this environment
        return false;
    }
}

module.exports = isSymbol;
