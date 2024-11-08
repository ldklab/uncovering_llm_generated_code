// dequal.js

/**
 * Function to deeply compare two values, `foo` and `bar`, to determine if they are equal.
 * It handles various data types including objects, arrays, sets, maps, dates, regexes,
 * typed arrays, and primitive data types like numbers, strings, booleans.
 */
function dequal(foo, bar) {
  // Check for reference equality
  if (foo === bar) return true;

  // Check if both values are objects
  if (foo && bar && typeof foo === 'object' && typeof bar === 'object') {
    // Check if both objects are of the same type
    if (foo.constructor !== bar.constructor) return false;

    // Arrays: compare length and elements
    if (Array.isArray(foo)) {
      const length = foo.length;
      if (length !== bar.length) return false;
      for (let i = 0; i < length; i++) {
        if (!dequal(foo[i], bar[i])) return false;
      }
      return true;
    }

    // Dates and Regex: compare string representation
    if ((foo instanceof Date || foo instanceof RegExp) && ('' + foo !== '' + bar)) return false;

    // Sets and Maps: compare size and entries
    if (foo instanceof Set || foo instanceof Map) {
      if (foo.size !== bar.size) return false;
      for (let i of foo.entries()) {
        if (!bar.has(i[0])) return false;
      }
      for (let i of bar.entries()) {
        if (!foo.has(i[0])) return false;
      }
      return true;
    }

    // Typed Arrays: compare byte length and data
    if (ArrayBuffer.isView(foo) && ArrayBuffer.isView(bar)) {
      const length = foo.byteLength;
      if (length !== bar.byteLength) return false;
      for (let i = 0; i < length; i++) {
        if (foo[i] !== bar[i]) return false;
      }
      return true;
    }

    // Objects: compare keys and values
    const keys = Object.keys(foo);
    if (keys.length !== Object.keys(bar).length) return false;
    for (let key of keys) {
      if (!bar.hasOwnProperty(key) || !dequal(foo[key], bar[key])) return false;
    }

    return true;
  }

  // Handle NaN case (NaN is not equal to NaN, but we consider them equal in this context)
  return foo !== foo && bar !== bar;
}

module.exports = { dequal };

// Example usage:
// const { dequal } = require('./dequal');
// console.log(dequal({ a: 1 }, { a: 1 })); // true
// console.log(dequal(new Date('2020-01-01'), new Date('2020-01-01'))); // true
// console.log(dequal([1, 2, 3], [1, 2, 3])); // true
// console.log(dequal([1, 2], [2, 1])); // false
