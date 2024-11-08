const has = Object.prototype.hasOwnProperty;

function findInIterable(iterable, target) {
  for (const key of iterable.keys()) {
    if (deepEqual(key, target)) return key;
  }
}

function deepEqual(value1, value2) {
  if (value1 === value2) return true;
  
  if (value1 != null && value2 != null && value1.constructor === value2.constructor) {
    const constructor = value1.constructor;

    if (constructor === Date) return value1.getTime() === value2.getTime();
    if (constructor === RegExp) return value1.toString() === value2.toString();

    if (constructor === Array) {
      if (value1.length !== value2.length) return false;
      return value1.every((item, index) => deepEqual(item, value2[index]));
    }

    if (constructor === Set) {
      if (value1.size !== value2.size) return false;
      for (const item of value1) {
        const comparableItem = (typeof item === 'object' && item !== null) ? findInIterable(value2, item) : item;
        if (!value2.has(comparableItem)) return false;
      }
      return true;
    }

    if (constructor === Map) {
      if (value1.size !== value2.size) return false;
      for (const [key, val] of value1) {
        const comparableKey = (typeof key === 'object' && key !== null) ? findInIterable(value2, key) : key;
        if (!deepEqual(val, value2.get(comparableKey))) return false;
      }
      return true;
    }

    if (constructor === ArrayBuffer) {
      return deepEqual(new Uint8Array(value1), new Uint8Array(value2));
    }

    if (constructor === DataView) {
      if (value1.byteLength !== value2.byteLength) return false;
      for (let i = 0; i < value1.byteLength; i++) {
        if (value1.getInt8(i) !== value2.getInt8(i)) return false;
      }
      return true;
    }

    if (ArrayBuffer.isView(value1)) {
      if (value1.byteLength !== value2.byteLength) return false;
      for (let i = 0; i < value1.length; i++) {
        if (value1[i] !== value2[i]) return false;
      }
      return true;
    }

    if (typeof value1 === 'object') {
      const keys1 = Object.keys(value1);
      const keys2 = Object.keys(value2);
      if (keys1.length !== keys2.length) return false;
      for (const key of keys1) {
        if (!has.call(value2, key) || !deepEqual(value1[key], value2[key])) return false;
      }
      return true;
    }
  }

  return isNaN(value1) && isNaN(value2);
}

exports.dequal = deepEqual;
