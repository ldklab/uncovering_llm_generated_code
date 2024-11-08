'use strict';

const hasSymbols = require('has-symbols');

function hasToStringTag() {
    return hasSymbols() && typeof Symbol.toStringTag === 'symbol';
}

module.exports = hasToStringTag;
