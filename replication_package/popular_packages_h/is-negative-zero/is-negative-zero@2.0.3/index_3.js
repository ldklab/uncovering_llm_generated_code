'use strict';

// Function to check if a given number is negative zero
module.exports = function isNegativeZero(number) {
    // Check if the number is zero and its reciprocal evaluates to negative infinity
    return number === 0 && (1 / number) === -Infinity;
};
