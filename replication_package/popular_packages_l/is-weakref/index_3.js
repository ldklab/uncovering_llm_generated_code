'use strict';

function isWeakRef(value) {
  // Check if the value is a non-null object
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  // Check if WeakRef is available and the value is an instance of WeakRef
  if (typeof WeakRef !== 'undefined' && value instanceof WeakRef) {
    return true;
  }

  // Use Object.prototype.toString to check for [object WeakRef]
  return Object.prototype.toString.call(value) === '[object WeakRef]';
}

module.exports = isWeakRef;
