'use strict';

module.exports = function(input) {
  // Check if the input is of type 'number' and validate it
  if (typeof input === 'number') {
    return input - input === 0; // Evaluates to true if input is a valid number
  }

  // Check if the input is a non-empty string that represents a number
  if (typeof input === 'string' && input.trim() !== '') {
    const parsedNumber = +input; // Convert string to a number
    return Number.isFinite ? Number.isFinite(parsedNumber) : isFinite(parsedNumber);
  }
  
  // Return false if neither of the above conditions are true
  return false;
};
