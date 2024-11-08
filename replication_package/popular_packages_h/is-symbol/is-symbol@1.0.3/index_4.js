'use strict';

const toStr = Object.prototype.toString;
const hasSymbols = require('has-symbols')();

const isSymbol = hasSymbols ? (value) => {
    if (typeof value === 'symbol') return true;

    if (toStr.call(value) !== '[object Symbol]') return false;

    try {
        const symToStr = Symbol.prototype.toString;
        const symStringRegex = /^Symbol\(.*\)$/;
        return symStringRegex.test(symToStr.call(value.valueOf()));
    } catch (e) {
        return false;
    }
} : () => false;

module.exports = isSymbol;
