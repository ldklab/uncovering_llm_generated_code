'use strict';

const hasSymbolSham = require('./shams');

function hasNativeSymbols() {
    if (typeof Symbol !== 'function') { return false; }
    if (typeof Symbol('foo') !== 'symbol') { return false; }
    
    return hasSymbolSham();
}

module.exports = hasNativeSymbols;
