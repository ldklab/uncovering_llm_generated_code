const hasOwnProperty = Object.prototype.hasOwnProperty;

function find(iterable, target) {
  for (let key of iterable.keys()) {
    if (dequal(key, target)) return key;
  }
}

function dequal(a, b) {
  if (a === b) return true;

  if (a && b && a.constructor === b.constructor) {
    switch (a.constructor) {
      case Date:
        return a.getTime() === b.getTime();
      case RegExp:
        return a.toString() === b.toString();
      case Array:
        if (a.length !== b.length) return false;
        return a.every((item, index) => dequal(item, b[index]));
      case Set:
        if (a.size !== b.size) return false;
        for (let item of a) {
          const obj = (typeof item === 'object' && item) ? find(b, item) : item;
          if (!b.has(obj)) return false;
        }
        return true;
      case Map:
        if (a.size !== b.size) return false;
        for (let [key, value] of a) {
          const objKey = (typeof key === 'object' && key) ? find(b, key) : key;
          if (!b.has(objKey) || !dequal(value, b.get(objKey))) return false;
        }
        return true;
      case ArrayBuffer:
      case DataView:
        return dequal(new Uint8Array(a), new Uint8Array(b));
      default:
        if (ArrayBuffer.isView(a)) {
          if (a.byteLength !== b.byteLength) return false;
          return Array.from(a).every((val, idx) => val === b[idx]);
        }
        if (typeof a === 'object') {
          const aKeys = Object.keys(a);
          return aKeys.length === Object.keys(b).length &&
                 aKeys.every(key => hasOwnProperty.call(b, key) && dequal(a[key], b[key]));
        }
    }
  }

  return a !== a && b !== b; // Handles NaN
}

exports.dequal = dequal;
