'use strict';

const originalSymbol = global.Symbol;
const checkSymbolSham = require('./shams');

function hasNativeSymbolSupport() {
    if (typeof originalSymbol !== 'function') return false;
    if (typeof Symbol !== 'function') return false;
    if (typeof originalSymbol('example') !== 'symbol') return false;
    if (typeof Symbol('test') !== 'symbol') return false;

    return checkSymbolSham();
}

module.exports = hasNativeSymbolSupport;
