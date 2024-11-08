'use strict';

// Function to determine if a value can successfully be used as a Date object by testing getDay
function canUseGetDay(value) {
  try {
    Date.prototype.getDay.call(value);
    return true;
  } catch (e) {
    return false;
  }
}

// Constants for type checking
const objectToString = Object.prototype.toString;
const dateString = '[object Date]';
const supportsSymbolToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

// Exported function that checks if the passed value is a Date object
module.exports = function isDateObject(value) {
  // Initial checks for non-objects or null values
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  // Choose method of determining if `value` is a Date object based on environment capability
  return supportsSymbolToStringTag ? canUseGetDay(value) : objectToString.call(value) === dateString;
};
