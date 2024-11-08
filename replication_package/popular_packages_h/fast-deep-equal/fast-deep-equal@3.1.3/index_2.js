'use strict';

// do not edit .js files directly - edit src/index.jst

module.exports = function equal(a, b) {
  // Step 1: Check for strict equality
  if (a === b) return true;

  // Step 2: Check if both are non-null objects
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    // Check if they have the same constructor
    if (a.constructor !== b.constructor) return false;

    // Array comparison
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => equal(item, b[index]));
    }

    // RegExp comparison
    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;

    // Objects with custom valueOf methods
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();

    // Objects with custom toString methods
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    // Object keys comparison
    const keysA = Object.keys(a);
    if (keysA.length !== Object.keys(b).length) return false;

    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key) || !equal(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  // Step 3: Check for both being NaN
  return a !== a && b !== b;
};
