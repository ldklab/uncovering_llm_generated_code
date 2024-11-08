'use strict';

module.exports = function isNumber(value) {
  // Check if the value is of type 'number' and is not NaN
  if (typeof value === 'number') {
    return !isNaN(value);
  }
  
  // Check if the value is a non-empty string that can be converted to a finite number
  if (typeof value === 'string' && value.trim().length > 0) {
    const numberValue = Number(value);
    return Number.isFinite ? Number.isFinite(numberValue) : isFinite(numberValue);
  }

  // Return false if the value is neither a valid number nor a convertible string
  return false;
};
