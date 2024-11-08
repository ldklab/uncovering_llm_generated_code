// is-weakref.js
'use strict';

function isWeakRef(value) {
  // Ensure the input is an object and WeakRef is defined
  if (typeof WeakRef !== 'undefined' && value instanceof WeakRef) {
    return true;
  }

  // Fallback for environments with potential realm issues
  return Object(value) === value && Object.prototype.toString.call(value) === '[object WeakRef]';
}

module.exports = isWeakRef;
