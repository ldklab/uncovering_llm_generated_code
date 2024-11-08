'use strict';

// do not edit .js files directly - edit src/index.jst

module.exports = function equal(a, b) {
  // Check for strict equality first
  if (a === b) return true;

  // Handle object comparison
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    // Ensure both objects have the same constructor
    if (a.constructor !== b.constructor) return false;

    // Handle array comparison
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!equal(a[i], b[i])) return false;
      }
      return true;
    }

    // Handle regular expression comparison
    if (a.constructor === RegExp) {
      return a.source === b.source && a.flags === b.flags;
    }

    // Handle objects with custom valueOf or toString methods
    if (a.valueOf !== Object.prototype.valueOf) {
      return a.valueOf() === b.valueOf();
    }
    if (a.toString !== Object.prototype.toString) {
      return a.toString() === b.toString();
    }

    // Retrieve keys of objects and compare
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    // Check for same keys and recursively compare values
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key) || !equal(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  // Check for NaN case
  return a !== a && b !== b;
};
