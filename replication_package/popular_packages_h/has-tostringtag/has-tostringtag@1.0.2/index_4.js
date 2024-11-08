'use strict';

var hasSymbolsSupport = require('has-symbols');

module.exports = function supportsToStringTag() {
    return hasSymbolsSupport() && typeof Symbol.toStringTag === 'symbol';
};
