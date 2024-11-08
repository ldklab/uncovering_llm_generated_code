'use strict';

const originalSymbol = global.Symbol;
const checkSymbolSham = require('./shams');

module.exports = function supportsNativeSymbols() {
    if (typeof originalSymbol !== 'function') { return false; }
    if (typeof Symbol !== 'function') { return false; }
    if (typeof originalSymbol('someLabel') !== 'symbol') { return false; }
    if (typeof Symbol('anotherLabel') !== 'symbol') { return false; }

    return checkSymbolSham();
};
