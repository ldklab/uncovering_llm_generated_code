'use strict';

module.exports = function equal(a, b) {
  // Primitive or direct comparison
  if (a === b) return true;

  // Check for objects (including arrays) and excluding null
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    // Different constructors mean they're not equal
    if (a.constructor !== b.constructor) return false;

    // Array specialized comparison
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!equal(a[i], b[i])) return false;
      }
      return true;
    }

    // Regular Expression specialized comparison
    if (a.constructor === RegExp) {
      return a.source === b.source && a.flags === b.flags;
    }

    // Generic valueOf comparison, if overridden
    if (a.valueOf !== Object.prototype.valueOf) {
      return a.valueOf() === b.valueOf();
    }

    // Generic toString comparison, if overridden
    if (a.toString !== Object.prototype.toString) {
      return a.toString() === b.toString();
    }

    // Keys comparison
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;

    // Existence and value comparison for each key
    for (let i = 0; i < keysA.length; i++) {
      if (!Object.prototype.hasOwnProperty.call(b, keysA[i]) || !equal(a[keysA[i]], b[keysA[i]])) {
        return false;
      }
    }

    return true;
  }

  // NaN check
  return a !== a && b !== b;
};
