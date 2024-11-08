var pSlice = Array.prototype.slice;

function getObjectKeys(obj) {
  if (typeof Object.keys === 'function') {
    return Object.keys(obj);
  } else {
    var keys = [];
    for (var key in obj) {
      keys.push(key);
    }
    return keys;
  }
}

var deepEqual = module.exports = function (actual, expected) {
  if (actual === 0 && expected === 0) {
    return areZerosEqual(actual, expected);
  } else if (actual === expected) {
    return true;
  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();
  } else if (isNumberNaN(actual)) {
    return isNumberNaN(expected);
  } else if (typeof actual != 'object' && typeof expected != 'object') {
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
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) {
    return false;
  }

  if (a.prototype !== b.prototype) {
    return false;
  }

  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b);
  }

  try {
    var ka = getObjectKeys(a), kb = getObjectKeys(b), key, i;
  } catch (e) {
    return false;
  }

  if (ka.length !== kb.length) {
    return false;
  }

  ka.sort();
  kb.sort();

  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i]) {
      return false;
    }
  }

  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
}
