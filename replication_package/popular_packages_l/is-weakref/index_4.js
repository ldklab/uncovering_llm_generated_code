// is-weakref.js
'use strict';

function isWeakRef(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (typeof WeakRef !== 'undefined' && value instanceof WeakRef) {
    return true;
  }

  return Object.prototype.toString.call(value) === '[object WeakRef]';
}

module.exports = isWeakRef;
