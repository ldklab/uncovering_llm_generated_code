// is-weakref.js
'use strict';

function isWeakRef(value) {
  // Direct check using try/catch in case of cross-realm WeakRef issues
  if (!value || typeof value !== 'object') {
    return false;
  }

  // Check if it's an instance of WeakRef
  if (typeof WeakRef !== 'undefined' && value instanceof WeakRef) {
    return true;
  }

  // Fallback to Object.prototype.toString check for more safety across realms
  return Object.prototype.toString.call(value) === '[object WeakRef]';
}

module.exports = isWeakRef;
