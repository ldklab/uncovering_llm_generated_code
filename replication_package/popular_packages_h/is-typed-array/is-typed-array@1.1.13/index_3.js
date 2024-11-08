'use strict';

const whichTypedArray = require('which-typed-array');

/** @type {import('.')} */
function isTypedArray(value) {
    return Boolean(whichTypedArray(value));
}

module.exports = isTypedArray;
