const deepEqual = (actual, expected) => {
  if (actual === 0 && expected === 0) return areZerosEqual(actual, expected);
  if (actual === expected) return true;
  if (actual instanceof Date && expected instanceof Date) return actual.getTime() === expected.getTime();
  if (isNumberNaN(actual)) return isNumberNaN(expected);
  if (typeof actual !== 'object' && typeof expected !== 'object') return actual == expected;
  return objEquiv(actual, expected);
};

const isUndefinedOrNull = value => value === null || value === undefined;

const isArguments = object => Object.prototype.toString.call(object) === '[object Arguments]';

const isNumberNaN = value => typeof value === 'number' && value !== value;

const areZerosEqual = (zeroA, zeroB) => (1 / zeroA) === (1 / zeroB);

const objEquiv = (a, b) => {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) return false;
  if (a.prototype !== b.prototype) return false;
  if (isArguments(a)) {
    if (!isArguments(b)) return false;
    a = Array.prototype.slice.call(a);
    b = Array.prototype.slice.call(b);
    return deepEqual(a, b);
  }
  
  try {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
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
  } catch {
    return false;
  }
  
  return true;
};

module.exports = deepEqual;
