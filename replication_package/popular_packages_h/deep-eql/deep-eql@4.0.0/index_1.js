'use strict';
const type = require('type-detect');

class FakeMap {
  constructor() {
    this._key = 'chai/deep-eql__' + Math.random() + Date.now();
  }

  get(key) {
    return key[this._key];
  }

  set(key, value) {
    if (Object.isExtensible(key)) {
      Object.defineProperty(key, this._key, {
        value,
        configurable: true,
      });
    }
  }
}

const MemoizeMap = typeof WeakMap === 'function' ? WeakMap : FakeMap;

function memoizeCompare(left, right, memoizeMap) {
  if (!memoizeMap || isPrimitive(left) || isPrimitive(right)) {
    return null;
  }
  const leftMap = memoizeMap.get(left);
  return leftMap ? leftMap.get(right) : null;
}

function memoizeSet(left, right, memoizeMap, result) {
  if (!memoizeMap || isPrimitive(left) || isPrimitive(right)) {
    return;
  }
  let leftMap = memoizeMap.get(left);
  if (!leftMap) {
    leftMap = new MemoizeMap();
    memoizeMap.set(left, leftMap);
  }
  leftMap.set(right, result);
}

module.exports = deepEqual;
module.exports.MemoizeMap = MemoizeMap;

function deepEqual(left, right, options) {
  if (options?.comparator) {
    return extensiveDeepEqual(left, right, options);
  }

  const simpleResult = simpleEqual(left, right);
  return simpleResult !== null ? simpleResult : extensiveDeepEqual(left, right, options);
}

function simpleEqual(left, right) {
  if (left === right) {
    return left !== 0 || 1 / left === 1 / right;
  }

  if (left !== left && right !== right) { // NaN equivalence
    return true;
  }

  return (isPrimitive(left) || isPrimitive(right)) ? false : null;
}

function extensiveDeepEqual(left, right, options = {}) {
  options.memoize = options.memoize === false ? false : options.memoize || new MemoizeMap();
  const comparator = options.comparator;

  const leftMemoized = memoizeCompare(left, right, options.memoize);
  if (leftMemoized !== null) return leftMemoized;

  const rightMemoized = memoizeCompare(right, left, options.memoize);
  if (rightMemoized !== null) return rightMemoized;

  if (comparator) {
    const compResult = comparator(left, right);
    if (compResult === true || compResult === false) {
      memoizeSet(left, right, options.memoize, compResult);
      return compResult;
    }
    
    const simpleResult = simpleEqual(left, right);
    if (simpleResult !== null) {
      return simpleResult;
    }
  }

  const leftType = type(left);
  if (leftType !== type(right)) {
    memoizeSet(left, right, options.memoize, false);
    return false;
  }

  memoizeSet(left, right, options.memoize, true);
  const result = extensiveDeepEqualByType(left, right, leftType, options);
  memoizeSet(left, right, options.memoize, result);
  return result;
}

function extensiveDeepEqualByType(left, right, type, options) {
  switch (type) {
    case 'String':
    case 'Number':
    case 'Boolean':
    case 'Date':
      return deepEqual(left.valueOf(), right.valueOf());
    case 'Promise':
    case 'Symbol':
    case 'function':
    case 'WeakMap':
    case 'WeakSet':
      return left === right;
    case 'Error':
      return keysEqual(left, right, ['name', 'message', 'code'], options);
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
      return iterableEqual(left, right, options);
    case 'RegExp':
      return regexpEqual(left, right);
    case 'Generator':
      return generatorEqual(left, right, options);
    case 'DataView':
      return iterableEqual(new Uint8Array(left.buffer), new Uint8Array(right.buffer), options);
    case 'ArrayBuffer':
      return iterableEqual(new Uint8Array(left), new Uint8Array(right), options);
    case 'Set':
    case 'Map':
      return entriesEqual(left, right, options);
    default:
      return objectEqual(left, right, options);
  }
}

function regexpEqual(left, right) {
  return left.toString() === right.toString();
}

function entriesEqual(left, right, options) {
  if (left.size !== right.size) {
    return false;
  }
  if (left.size === 0) {
    return true;
  }
  const leftEntries = [];
  const rightEntries = [];
  left.forEach((value, key) => leftEntries.push([key, value]));
  right.forEach((value, key) => rightEntries.push([key, value]));
  return iterableEqual(leftEntries.sort(), rightEntries.sort(), options);
}

function iterableEqual(left, right, options) {
  const length = left.length;
  if (length !== right.length) return false;
  if (length === 0) return true;

  for (let i = 0; i < length; i++) {
    if (!deepEqual(left[i], right[i], options)) {
      return false;
    }
  }
  return true;
}

function generatorEqual(left, right, options) {
  return iterableEqual(getGeneratorEntries(left), getGeneratorEntries(right), options);
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
    } catch {
      return [];
    }
  }
  return [];
}

function getGeneratorEntries(generator) {
  let accumulator = [], result;
  while (!(result = generator.next()).done) {
    accumulator.push(result.value);
  }
  return accumulator;
}

function getEnumerableKeys(target) {
  const keys = [];
  for (let key in target) {
    keys.push(key);
  }
  return keys;
}

function keysEqual(left, right, keys, options) {
  for (const key of keys) {
    if (!deepEqual(left[key], right[key], options)) {
      return false;
    }
  }
  return true;
}

function objectEqual(left, right, options) {
  const leftKeys = getEnumerableKeys(left);
  const rightKeys = getEnumerableKeys(right);

  if (leftKeys.length === rightKeys.length && iterableEqual(leftKeys.sort(), rightKeys.sort())) {
    return keysEqual(left, right, leftKeys, options);
  }

  const leftEntries = getIteratorEntries(left);
  const rightEntries = getIteratorEntries(right);

  if (leftEntries.length === rightEntries.length) {
    return iterableEqual(leftEntries.sort(), rightEntries.sort(), options);
  }

  return leftKeys.length === 0 && leftEntries.length === 0 &&
         rightKeys.length === 0 && rightEntries.length === 0;
}

function isPrimitive(value) {
  return value === null || typeof value !== 'object';
}
