// dequal.js
function dequal(foo, bar) {
  if (foo === bar) return true;

  if (foo && bar && typeof foo === 'object' && typeof bar === 'object') {
    if (foo.constructor !== bar.constructor) return false;

    let length, i;
    if (Array.isArray(foo)) {
      length = foo.length;
      if (length !== bar.length) return false;
      for (i = length; i--;)
        if (!dequal(foo[i], bar[i])) return false;
      return true;
    }

    if ((foo.constructor === RegExp || foo.constructor === Date) && (String(foo) !== String(bar)))
      return false;

    if (foo.constructor === Set || foo.constructor === Map) {
      if (foo.size !== bar.size) return false;
      for (const element of foo)
        if (!bar.has(element)) return false;
      for (const element of bar)
        if (!foo.has(element)) return false;
      return true;
    }

    if (ArrayBuffer.isView(foo) && ArrayBuffer.isView(bar)) {
      length = foo.byteLength;
      if (length !== bar.byteLength) return false;
      for (i = length; i--;)
        if (foo[i] !== bar[i]) return false;
      return true;
    }

    const fooKeys = Object.keys(foo);
    length = fooKeys.length;
    if (length !== Object.keys(bar).length)
      return false;

    for (i = length; i--;)
      if (!bar.hasOwnProperty(fooKeys[i])) return false;

    for (i = length; i--;) {
      const key = fooKeys[i];
      if (!dequal(foo[key], bar[key])) return false;
    }

    return true;
  }

  return foo !== foo && bar !== bar; // Handle NaN equality
}

module.exports = { dequal };

// Example usage:
// const { dequal } = require('./dequal');
// console.log(dequal({ a: 1 }, { a: 1 }));   // true
// console.log(dequal(new Date('2020-01-01'), new Date('2020-01-01'))); // true
// console.log(dequal([1, 2, 3], [1, 2, 3])); // true
// console.log(dequal([1, 2], [2, 1]));       // false
