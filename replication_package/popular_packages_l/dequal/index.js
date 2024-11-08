// dequal.js
function dequal(foo, bar) {
  if (foo === bar) return true;

  if (foo && bar && typeof foo == 'object' && typeof bar == 'object') {
    if (foo.constructor !== bar.constructor) return false;

    let length, i, keys;
    if (Array.isArray(foo)) {
      length = foo.length;
      if (length != bar.length) return false;
      for (i = length; i-- !== 0;)
        if (!dequal(foo[i], bar[i])) return false;
      return true;
    }

    if ((foo.constructor === RegExp || foo.constructor === Date) && ('' + foo !== '' + bar))
      return false;

    if (foo.constructor === Set || foo.constructor === Map) {
      if (foo.size !== bar.size) return false;
      for (i of foo.entries())
        if (!bar.has(i[0])) return false;
      for (i of bar.entries())
        if (!foo.has(i[0])) return false;
      return true;
    }

    if (ArrayBuffer.isView(foo) && ArrayBuffer.isView(bar)) {
      length = foo.byteLength;
      if (length != bar.byteLength) return false;
      for (i = length; i-- !== 0;)
        if (foo[i] !== bar[i]) return false;
      return true;
    }

    keys = Object.keys(foo);
    length = keys.length;
    if (length !== Object.keys(bar).length)
      return false;

    for (i = length; i-- !== 0;)
      if (!bar.hasOwnProperty(keys[i])) return false;

    for (i = length; i-- !== 0;) {
      const key = keys[i];
      if (!dequal(foo[key], bar[key])) return false;
    }

    return true;
  }

  return foo !== foo && bar !== bar; // NaN case
}

module.exports = { dequal };

// Example usage:
// const { dequal } = require('./dequal');
// console.log(dequal({ a: 1 }, { a: 1 })); // true
// console.log(dequal(new Date('2020-01-01'), new Date('2020-01-01'))); // true
// console.log(dequal([1, 2, 3], [1, 2, 3])); // true
// console.log(dequal([1, 2], [2, 1])); // false
