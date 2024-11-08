'use strict';

/**
 * This function checks if the input is a number. It returns true if the input is either a number or a numeric string that can be converted to a finite number.
 * @param {*} num - The value to be checked.
 * @returns {boolean} - Returns true if the value is a number or a finite numeric string. Otherwise, returns false.
 */
module.exports = function(num) {
  // Check if the input is of type 'number'
  if (typeof num === 'number') {
    // Return true if the number minus itself equals zero, which always holds true for valid numbers.
    return num - num === 0;
  }
  // Check if the input is a non-empty string
  if (typeof num === 'string' && num.trim() !== '') {
    // Convert the string to a number and check if it is finite
    return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
  }
  // If neither condition is met, return false
  return false;
};
