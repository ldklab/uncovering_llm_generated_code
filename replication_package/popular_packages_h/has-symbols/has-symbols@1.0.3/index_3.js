'use strict';

const origSymbol = typeof Symbol !== 'undefined' && Symbol;
const hasSymbolSham = require('./shams');

function hasNativeSymbols() {
    if (typeof origSymbol !== 'function') { return false; }
    if (typeof Symbol !== 'function') { return false; }
    if (typeof origSymbol('foo') !== 'symbol') { return false; }
    if (typeof Symbol('bar') !== 'symbol') { return false; }

    return hasSymbolSham();
}

module.exports = hasNativeSymbols;
