'use strict';

const hasSymbols = require('has-symbols');

// Function to check for support of Symbol.toStringTag.
module.exports = function hasToStringTag() {
    // Check if symbols are supported and if Symbol.toStringTag exists as a symbol.
    return hasSymbols() && typeof Symbol.toStringTag === 'symbol';
};
