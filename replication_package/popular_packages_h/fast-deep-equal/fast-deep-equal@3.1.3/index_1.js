'use strict';

// do not edit .js files directly - edit src/index.jst

module.exports = function equal(a, b) {
  if (a === b) return true;

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a.constructor !== b.constructor) return false;

    if (Array.isArray(a)) {
      const length = a.length;
      if (length !== b.length) return false;
      for (let i = 0; i < length; i++) {
        if (!equal(a[i], b[i])) return false;
      }
      return true;
    }

    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    const aKeys = Object.keys(a);
    if (aKeys.length !== Object.keys(b).length) return false;

    for (let i = 0; i < aKeys.length; i++) {
      const key = aKeys[i];
      if (!Object.prototype.hasOwnProperty.call(b, key) || !equal(a[key], b[key])) return false;
    }

    return true;
  }

  return a !== a && b !== b;
};
