function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

function areDatesEqual(a, b) {
  return a.getTime() === b.getTime();
}

function areRegExpsEqual(a, b) {
  return a.toString() === b.toString();
}

function areArraysEqual(a, b, deepEqual) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!deepEqual(a[i], b[i])) return false;
  }
  return true;
}

function areObjectsEqual(a, b, deepEqual) {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (let key of keysA) {
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

function deepEqualBase(a, b, options) {
  if (a === b) return true;
  if (!isObject(a) || !isObject(b)) return false;

  const { compareFunctions, compareIterables } = options;
  if (compareFunctions) {
    if (a instanceof Date && b instanceof Date) {
      return areDatesEqual(a, b);
    }
    if (a instanceof RegExp && b instanceof RegExp) {
      return areRegExpsEqual(a, b);
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      return areArraysEqual(a, b, deepEqualBase);
    }
  }
  if (compareIterables && compareIterables(a, b, deepEqualBase)) {
    return true;
  }
  return areObjectsEqual(a, b, deepEqualBase);
}

const deepEqual = (a, b) => deepEqualBase(a, b, {
  compareFunctions: true,
  compareIterables: () => false,
});

const deepEqualES6 = (a, b) => deepEqualBase(a, b, {
  compareFunctions: true,
  compareIterables: (a, b, deepEqual) => {
    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      for (let [key, value] of a) {
        if (!b.has(key) || !deepEqual(value, b.get(key))) return false;
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
      return a.byteLength === b.byteLength && [...a].every((val, i) => val === b[i]);
    }
    return false;
  },
});

const reactEqual = (a, b) => {
  const deepEqualReact = (a, b, visited) => {
    if (a === b) return true;
    if (!isObject(a) || !isObject(b)) return false;

    // Compare arrays ensuring array length
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqualReact(a[i], b[i], visited)) return false;
      }
      return true;
    }
  
    // Object comparison with React-specific property exclusion
    const keysA = Object.keys(a).filter(key => key !== '_owner');
    const keysB = Object.keys(b).filter(key => key !== '_owner');
    if (keysA.length !== keysB.length) return false;
    for (let key of keysA) {
      if (!deepEqualReact(a[key], b[key], visited)) return false;
    }
    return true;
  };
  
  return deepEqualReact(a, b, new Set());
};

module.exports = {
  deepEqual,
  deepEqualES6,
  reactEqual
};
