'use strict';

const whichTypedArray = require('which-typed-array');

/**
 * Checks if a given value is a typed array.
 * 
 * @param {*} value - The value to check.
 * @returns {boolean} - Returns `true` if value is a typed array, otherwise `false`.
 */
module.exports = function isTypedArray(value) {
    return Boolean(whichTypedArray(value));
};
