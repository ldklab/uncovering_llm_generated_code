// dequal.js
function dequal(foo, bar) {
  // Check for primitive equality
  if (foo === bar) return true;

  // Check for object type and reference
  if (foo && bar && typeof foo === 'object' && typeof bar === 'object') {
    if (foo.constructor !== bar.constructor) return false; // Different constructors

    let length, i, keys;

    // Array comparison
    if (Array.isArray(foo)) {
      length = foo.length;
      if (length !== bar.length) return false;
      for (i = 0; i < length; i++) {
        if (!dequal(foo[i], bar[i])) return false;
      }
      return true;
    }

    // RegExp and Date comparison by string
    if ((foo.constructor === RegExp || foo.constructor === Date) && ('' + foo !== '' + bar))
      return false;

    // Set and Map comparison
    if (foo.constructor === Set || foo.constructor === Map) {
      if (foo.size !== bar.size) return false;
      for (i of foo.entries()) {
        if (!bar.has(i[0])) return false;
      }
      for (i of bar.entries()) {
        if (!foo.has(i[0])) return false;
      }
      return true;
    }

    // Typed Array comparison
    if (ArrayBuffer.isView(foo) && ArrayBuffer.isView(bar)) {
      length = foo.byteLength;
      if (length !== bar.byteLength) return false;
      for (i = 0; i < length; i++) {
        if (foo[i] !== bar[i]) return false;
      }
      return true;
    }

    // Object comparison
    keys = Object.keys(foo);
    length = keys.length;
    if (length !== Object.keys(bar).length) return false;
    for (i = 0; i < length; i++) {
      if (!bar.hasOwnProperty(keys[i])) return false;
    }
    for (i = 0; i < length; i++) {
      const key = keys[i];
      if (!dequal(foo[key], bar[key])) return false;
    }

    return true;
  }

  // Handle NaN case as NaN !== NaN in JS
  return foo !== foo && bar !== bar;
}

module.exports = { dequal };

// Example usage:
// const { dequal } = require('./dequal');
// console.log(dequal({ a: 1 }, { a: 1 })); // true
// console.log(dequal(new Date('2020-01-01'), new Date('2020-01-01'))); // true
// console.log(dequal([1, 2, 3], [1, 2, 3])); // true
// console.log(dequal([1, 2], [2, 1])); // false
