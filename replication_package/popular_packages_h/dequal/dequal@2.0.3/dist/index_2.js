function isObjectLike(value) {
  return typeof value === 'object' && value !== null;
}

function findKeyInSet(set, targetKey) {
  for (const key of set.keys()) {
    if (deepEqual(key, targetKey)) {
      return key;
    }
  }
}

function deepEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (a && b && a.constructor === b.constructor) {
    switch (a.constructor) {
      case Date:
        return a.getTime() === b.getTime();
      
      case RegExp:
        return a.toString() === b.toString();
      
      case Array:
        if (a.length !== b.length) return false;
        return a.every((element, index) => deepEqual(element, b[index]));
      
      case Set:
        if (a.size !== b.size) return false;
        for (let value of a) {
          if (isObjectLike(value)) {
            value = findKeyInSet(b, value);
            if (value === undefined) return false;
          }
          if (!b.has(value)) return false;
        }
        return true;
      
      case Map:
        if (a.size !== b.size) return false;
        for (let [key, value] of a) {
          if (isObjectLike(key)) {
            key = findKeyInSet(b, key);
            if (key === undefined) return false;
          }
          if (!deepEqual(value, b.get(key))) return false;
        }
        return true;
      
      case ArrayBuffer:
      case DataView:
      case Uint8Array:
        return new Uint8Array(a).every((byte, idx) => byte === new Uint8Array(b)[idx]);
      
      default:
        if (isObjectLike(a)) {
          const aKeys = Object.keys(a);
          const bKeys = Object.keys(b);
          if (aKeys.length !== bKeys.length) return false;
          return aKeys.every(key => hasOwnProperty.call(b, key) && deepEqual(a[key], b[key]));
        }
    }
  }

  return a !== a && b !== b; // Check for NaN
}

exports.deepEqual = deepEqual;
