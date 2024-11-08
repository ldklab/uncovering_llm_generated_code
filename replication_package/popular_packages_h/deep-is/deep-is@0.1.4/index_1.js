const pSlice = Array.prototype.slice;
const Object_keys = Object.keys || function (obj) {
  const keys = [];
  for (let key in obj) keys.push(key);
  return keys;
};

const deepEqual = module.exports = function (actual, expected) {
  if (actual === 0 && expected === 0) {
    return areZerosEqual(actual, expected);
  } else if (actual === expected) {
    return true;
  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();
  } else if (isNumberNaN(actual)) {
    return isNumberNaN(expected);
  } else if (typeof actual !== 'object' && typeof expected !== 'object') {
    return actual == expected;
  } else {
    return objEquiv(actual, expected);
  }
};

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) === '[object Arguments]';
}

function isNumberNaN(value) {
  return typeof value === 'number' && value !== value;
}

function areZerosEqual(zeroA, zeroB) {
  return (1 / zeroA) === (1 / zeroB);
}

function objEquiv(a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) return false;
  if (a.prototype !== b.prototype) return false;

  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b);
  }
  
  try {
    const ka = Object_keys(a),
          kb = Object_keys(b);
    
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
    
    return true;
  } catch (e) {
    return false;
  }
}
