'use strict';

const originalSymbol = global.Symbol;
const checkSymbolSham = require('./shams');

module.exports = function hasNativeSymbols() {
    if (typeof originalSymbol !== 'function') return false;
    if (typeof Symbol !== 'function') return false;
    if (typeof originalSymbol('foo') !== 'symbol') return false;
    if (typeof Symbol('bar') !== 'symbol') return false;
    
    return checkSymbolSham();
};
