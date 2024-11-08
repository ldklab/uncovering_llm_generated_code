const deepEqual = module.exports = function (actual, expected) {
  if (actual === 0 && expected === 0) return areZerosEqual(actual, expected);
  if (actual === expected) return true;
  if (actual instanceof Date && expected instanceof Date) return actual.getTime() === expected.getTime();
  if (isNumberNaN(actual)) return isNumberNaN(expected);
  if (typeof actual !== 'object' && typeof expected !== 'object') return actual == expected;
  return objEquiv(actual, expected);
};

function areZerosEqual(zeroA, zeroB) {
  return (1 / zeroA) === (1 / zeroB);
}

function isNumberNaN(value) {
  return typeof value === 'number' && value !== value;
}

function objEquiv(a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) return false;
  if (a.prototype !== b.prototype) return false;

  if (isArguments(a)) {
    if (!isArguments(b)) return false;
    a = Array.from(a);
    b = Array.from(b);
    return deepEqual(a, b);
  }

  try {
    const ka = getObjectKeys(a);
    const kb = getObjectKeys(b);

    if (ka.length !== kb.length) return false;
    ka.sort();
    kb.sort();

    for (let i = ka.length - 1; i >= 0; i--) {
      if (ka[i] !== kb[i]) return false;
    }

    for (let i = ka.length - 1; i >= 0; i--) {
      const key = ka[i];
      if (!deepEqual(a[key], b[key])) return false;
    }
  } catch (e) {
    return false;
  }
  
  return true;
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) === '[object Arguments]';
}

const getObjectKeys = typeof Object.keys === 'function' ? Object.keys : function (obj) {
  const keys = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
};
