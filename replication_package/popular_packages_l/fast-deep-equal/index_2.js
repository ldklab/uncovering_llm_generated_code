// Helper functions
function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

function areDatesEqual(a, b) {
  return a.getTime() === b.getTime();
}

function areRegExpsEqual(a, b) {
  return a.toString() === b.toString();
}

function areArraysEqual(a, b, comparator) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!comparator(a[i], b[i])) return false;
  }
  return true;
}

function areObjectsEqual(a, b, comparator) {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (let key of keysA) {
    if (!comparator(a[key], b[key])) return false;
  }
  return true;
}

// Generic deep equality function
function createDeepEqual(comparator) {
  return function(a, b) {
    if (a === b) return true;
    if (!isObject(a) || !isObject(b)) return false;

    if (a instanceof Date && b instanceof Date) {
      return areDatesEqual(a, b);
    }
    if (a instanceof RegExp && b instanceof RegExp) {
      return areRegExpsEqual(a, b);
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      return areArraysEqual(a, b, comparator);
    }
    return areObjectsEqual(a, b, comparator);
  };
}

// Standard deep equality
const deepEqual = createDeepEqual(function(a, b) {
  return deepEqual(a, b);
});
module.exports = deepEqual;

// ES6-specific deep equality
const deepEqualES6 = createDeepEqual(function(a, b) {
  if (a === b) return true;
  if (!isObject(a) || !isObject(b)) return false;
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (let [key, value] of a) {
      if (!b.has(key) || !deepEqualES6(value, b.get(key))) return false;
    }
    return true;
  }
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (let value of a) {
      if (!b.has(value)) return false;
    }
    return true;
  }
  if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
    return a.byteLength === b.byteLength && a.every((val, i) => val === b[i]);
  }
  return areObjectsEqual(a, b, deepEqualES6);
});
module.exports = deepEqualES6;

// React-specific deep equality that ignores `_owner`
function deepEqualReact(a, b, visited = new Set()) {
  if (a === b) return true;
  if (!isObject(a) || !isObject(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return areArraysEqual(a, b, (x, y) => deepEqualReact(x, y, visited));
  }
  const keysA = Object.keys(a).filter(key => key !== '_owner');
  const keysB = Object.keys(b).filter(key => key !== '_owner');
  if (keysA.length !== keysB.length) return false;
  return areObjectsEqual(a, b, (x, y) => deepEqualReact(x, y, visited));
}

module.exports = function(a, b) {
  return deepEqualReact(a, b);
};
