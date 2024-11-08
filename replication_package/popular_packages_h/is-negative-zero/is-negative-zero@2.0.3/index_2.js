'use strict';

/**
 * Checks if the given number is negative zero.
 *
 * @param {number} number - The number to check.
 * @returns {boolean} True if the number is negative zero, otherwise false.
 */
function isNegativeZero(number) {
    return number === 0 && (1 / number) === -Infinity;
}

module.exports = isNegativeZero;
