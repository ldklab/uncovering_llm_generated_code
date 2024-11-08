'use strict';

const originalSymbol = global.Symbol;
const hasShamSymbol = require('./shams');

module.exports = function detectNativeSymbols() {
    if (typeof originalSymbol !== 'function') { 
        return false; 
    }
    if (typeof Symbol !== 'function') { 
        return false; 
    }
    if (typeof originalSymbol('test') !== 'symbol') { 
        return false; 
    }
    if (typeof Symbol('example') !== 'symbol') { 
        return false; 
    }

    return hasShamSymbol();
};
