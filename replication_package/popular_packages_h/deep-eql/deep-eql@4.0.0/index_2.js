'use strict';

const type = require('type-detect');

function FakeMap() {
  this._key = `chai/deep-eql__${Math.random()}${Date.now()}`;
}

FakeMap.prototype = {
  get(key) {
    return key[this._key];
  },
  set(key, value) {
    if (Object.isExtensible(key)) {
      Object.defineProperty(key, this._key, {
        value,
        configurable: true
      });
    }
  }
};

const MemoizeMap = typeof WeakMap === 'function' ? WeakMap : FakeMap;

function memoizeCompare(lhs, rhs, memoizeMap) {
  if (!memoizeMap || isPrimitive(lhs) || isPrimitive(rhs)) return null;
  const lhsMap = memoizeMap.get(lhs);
  if (lhsMap) {
    const result = lhsMap.get(rhs);
    if (typeof result === 'boolean') return result;
  }
  return null;
}

function memoizeSet(lhs, rhs, memoizeMap, result) {
  if (!memoizeMap || isPrimitive(lhs) || isPrimitive(rhs)) return;
  let lhsMap = memoizeMap.get(lhs);
  if (lhsMap) {
    lhsMap.set(rhs, result);
  } else {
    lhsMap = new MemoizeMap();
    lhsMap.set(rhs, result);
    memoizeMap.set(lhs, lhsMap);
  }
}

module.exports = deepEqual;
module.exports.MemoizeMap = MemoizeMap;

function deepEqual(lhs, rhs, options = {}) {
  if (options.comparator) {
    return extensiveDeepEqual(lhs, rhs, options);
  }
  const simpleResult = simpleEqual(lhs, rhs);
  if (simpleResult !== null) return simpleResult;
  return extensiveDeepEqual(lhs, rhs, options);
}

function simpleEqual(lhs, rhs) {
  if (lhs === rhs) {
    return lhs !== 0 || 1 / lhs === 1 / rhs;
  }
  if (lhs !== lhs && rhs !== rhs) return true;
  if (isPrimitive(lhs) || isPrimitive(rhs)) return false;
  return null;
}

function extensiveDeepEqual(lhs, rhs, options) {
  options = {
    memoize: options.memoize === false ? false : options.memoize || new MemoizeMap(),
    comparator: options.comparator,
    ...options
  };

  const memoizeResult = memoizeCompare(lhs, rhs, options.memoize);
  if (memoizeResult !== null) return memoizeResult;

  if (options.comparator) {
    const comparatorResult = options.comparator(lhs, rhs);
    if (comparatorResult === true || comparatorResult === false) {
      memoizeSet(lhs, rhs, options.memoize, comparatorResult);
      return comparatorResult;
    }
    const simpleResult = simpleEqual(lhs, rhs);
    if (simpleResult !== null) return simpleResult;
  }

  const lhsType = type(lhs);
  if (lhsType !== type(rhs)) {
    memoizeSet(lhs, rhs, options.memoize, false);
    return false;
  }

  memoizeSet(lhs, rhs, options.memoize, true);

  const result = extensiveDeepEqualByType(lhs, rhs, lhsType, options);
  memoizeSet(lhs, rhs, options.memoize, result);
  return result;
}

function extensiveDeepEqualByType(lhs, rhs, typeStr, options) {
  switch (typeStr) {
    case 'String':
    case 'Number':
    case 'Boolean':
    case 'Date':
      return deepEqual(lhs.valueOf(), rhs.valueOf());
    case 'Promise':
    case 'Symbol':
    case 'function':
    case 'WeakMap':
    case 'WeakSet':
      return lhs === rhs;
    case 'Error':
      return keysEqual(lhs, rhs, ['name', 'message', 'code'], options);
    case 'Arguments':
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float32Array':
    case 'Float64Array':
    case 'Array':
      return iterableEqual(lhs, rhs, options);
    case 'RegExp':
      return regexpEqual(lhs, rhs);
    case 'Generator':
      return generatorEqual(lhs, rhs, options);
    case 'DataView':
      return iterableEqual(new Uint8Array(lhs.buffer), new Uint8Array(rhs.buffer), options);
    case 'ArrayBuffer':
      return iterableEqual(new Uint8Array(lhs), new Uint8Array(rhs), options);
    case 'Set':
    case 'Map':
      return entriesEqual(lhs, rhs, options);
    default:
      return objectEqual(lhs, rhs, options);
  }
}

function regexpEqual(lhs, rhs) {
  return lhs.toString() === rhs.toString();
}

function entriesEqual(lhs, rhs, options) {
  if (lhs.size !== rhs.size) return false;
  if (lhs.size === 0) return true;

  const lhsItems = [];
  const rhsItems = [];
  lhs.forEach(function gatherEntries(key, value) {
    lhsItems.push([key, value]);
  });
  rhs.forEach(function gatherEntries(key, value) {
    rhsItems.push([key, value]);
  });
  return iterableEqual(lhsItems.sort(), rhsItems.sort(), options);
}

function iterableEqual(lhs, rhs, options) {
  if (lhs.length !== rhs.length) return false;
  if (lhs.length === 0) return true;

  for (let i = 0; i < lhs.length; i++) {
    if (!deepEqual(lhs[i], rhs[i], options)) return false;
  }
  return true;
}

function generatorEqual(lhs, rhs, options) {
  return iterableEqual(getGeneratorEntries(lhs), getGeneratorEntries(rhs), options);
}

function hasIteratorFunction(target) {
  return typeof Symbol !== 'undefined' &&
    typeof target === 'object' &&
    typeof Symbol.iterator !== 'undefined' &&
    typeof target[Symbol.iterator] === 'function';
}

function getIteratorEntries(target) {
  if (hasIteratorFunction(target)) {
    try {
      return getGeneratorEntries(target[Symbol.iterator]());
    } catch (iteratorError) {
      return [];
    }
  }
  return [];
}

function getGeneratorEntries(generator) {
  const entries = [];
  let result;
  while (!(result = generator.next()).done) {
    entries.push(result.value);
  }
  return entries;
}

function getEnumerableKeys(target) {
  const keys = [];
  for (const key in target) {
    keys.push(key);
  }
  return keys;
}

function keysEqual(lhs, rhs, keys, options) {
  for (let key of keys) {
    if (!deepEqual(lhs[key], rhs[key], options)) return false;
  }
  return true;
}

function objectEqual(lhs, rhs, options) {
  const lhsKeys = getEnumerableKeys(lhs);
  const rhsKeys = getEnumerableKeys(rhs);

  if (lhsKeys.length && lhsKeys.length === rhsKeys.length) {
    lhsKeys.sort();
    rhsKeys.sort();
    if (!iterableEqual(lhsKeys, rhsKeys)) return false;
    return keysEqual(lhs, rhs, lhsKeys, options);
  }

  const lhsEntries = getIteratorEntries(lhs);
  const rhsEntries = getIteratorEntries(rhs);

  if (lhsEntries.length && lhsEntries.length === rhsEntries.length) {
    lhsEntries.sort();
    rhsEntries.sort();
    return iterableEqual(lhsEntries, rhsEntries, options);
  }

  return lhsKeys.length === 0 && lhsEntries.length === 0 &&
         rhsKeys.length === 0 && rhsEntries.length === 0;
}

function isPrimitive(value) {
  return value === null || typeof value !== 'object';
}
