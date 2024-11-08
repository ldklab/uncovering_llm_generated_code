'use strict';

function isNumber(num) {
  // Check if the type of num is 'number'
  if (typeof num === 'number') {
    // Verify that num is not NaN
    return num - num === 0;
  }
  
  // Check if num is a non-empty string
  if (typeof num === 'string' && num.trim() !== '') {
    // Attempt to parse the string as a number and verify it is finite
    const parsedNum = +num;
    return Number.isFinite ? Number.isFinite(parsedNum) : isFinite(parsedNum);
  }

  // For all other cases, return false
  return false;
}

module.exports = isNumber;
