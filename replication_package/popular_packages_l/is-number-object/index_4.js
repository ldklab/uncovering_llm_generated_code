'use strict';

// Function to determine if a value is a number (either primitive or object)
function isNumber(value) {
  if (typeof value === 'number') {
    // Check if it's a primitive number
    return true;
  }
  
  if (typeof value === 'object' && value !== null) {
    // Check if it's a Number object
    return Object.prototype.toString.call(value) === '[object Number]';
  }
  
  // Return false if neither a primitive number nor a Number object
  return false;
}

// Export the isNumber function for external use
module.exports = isNumber;
