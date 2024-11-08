'use strict';

const type = require('type-detect');

class CustomMap {
  constructor() {
    this.uniqueKey = `custom/deep-eql__${Math.random() + Date.now()}`;
  }

  get(key) {
    return key[this.uniqueKey];
  }

  set(key, value) {
    if (Object.isExtensible(key)) {
      Object.defineProperty(key, this.uniqueKey, { value, configurable: true });
    }
  }
}

const MemoizeMap = typeof WeakMap === 'function' ? WeakMap : CustomMap;

function deepEqual(left, right, options = {}) {
  if (options.comparator) {
    return advancedComparison(left, right, options);
  }

  const primitiveResult = isPrimitiveEqual(left, right);
  if (primitiveResult !== null) return primitiveResult;

  return advancedComparison(left, right, options);
}

function isPrimitiveEqual(left, right) {
  if (left === right) {
    return left !== 0 || 1 / left === 1 / right;
  }
  if (left !== left && right !== right) {
    return true;
  }
  if (isPrimitive(left) || isPrimitive(right)) {
    return false;
  }
  return null;
}

function isPrimitive(value) {
  return value === null || typeof value !== 'object';
}

function advancedComparison(left, right, options) {
  options.memoize = options.memoize === false ? false : options.memoize || new MemoizeMap();
  
  const memoizedResult = memoCheck(left, right, options.memoize) || memoCheck(right, left, options.memoize);
  if (memoizedResult !== null) return memoizedResult;

  if (options.comparator) {
    const comparatorResult = options.comparator(left, right);
    if (typeof comparatorResult === 'boolean') {
      memoizeResult(left, right, options.memoize, comparatorResult);
      return comparatorResult;
    }
    const primitiveResult = isPrimitiveEqual(left, right);
    if (primitiveResult !== null) return primitiveResult;
  }

  const leftType = type(left);
  if (leftType !== type(right)) {
    memoizeResult(left, right, options.memoize, false);
    return false;
  }

  memoizeResult(left, right, options.memoize, true);
  const result = compareByType(left, right, leftType, options);
  memoizeResult(left, right, options.memoize, result);
  return result;
}

function memoCheck(left, right, map) {
  if (!map || isPrimitive(left) || isPrimitive(right)) return null;
  const leftMap = map.get(left);
  if (leftMap) {
    const result = leftMap.get(right);
    return typeof result === 'boolean' ? result : null;
  }
  return null;
}

function memoizeResult(left, right, map, result) {
  if (!map || isPrimitive(left) || isPrimitive(right)) return;
  let leftMap = map.get(left);
  if (!leftMap) {
    leftMap = new MemoizeMap();
    map.set(left, leftMap);
  }
  leftMap.set(right, result);
}

function compareByType(left, right, typeStr, options) {
  switch (typeStr) {
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
      return matchKeys(left, right, ['name', 'message', 'code'], options);
    case 'Array':
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
      return areIterablesEqual(left, right, options);
    case 'RegExp':
      return left.toString() === right.toString();
    case 'DataView':
      return areIterablesEqual(new Uint8Array(left.buffer), new Uint8Array(right.buffer), options);
    case 'ArrayBuffer':
      return areIterablesEqual(new Uint8Array(left), new Uint8Array(right), options);
    case 'Set':
    case 'Map':
      return compareEntries(left, right, options);
    default:
      return compareObjects(left, right, options);
  }
}

function matchKeys(left, right, keys, options) {
  for (let key of keys) {
    if (!deepEqual(left[key], right[key], options)) {
      return false;
    }
  }
  return true;
}

function areIterablesEqual(left, right, options) {
  const length = left.length;
  if (length !== right.length) return false;
  
  for (let i = 0; i < length; i++) {
    if (!deepEqual(left[i], right[i], options)) return false;
  }
  return true;
}

function compareEntries(left, right, options) {
  if (left.size !== right.size) return false;

  const leftEntries = [];
  const rightEntries = [];

  left.forEach((v, k) => leftEntries.push([k, v]));
  right.forEach((v, k) => rightEntries.push([k, v]));

  return areIterablesEqual(leftEntries.sort(), rightEntries.sort(), options);
}

function compareObjects(left, right, options) {
  const leftKeys = getAllKeys(left);
  const rightKeys = getAllKeys(right);

  if (leftKeys.length !== rightKeys.length) return false;

  leftKeys.sort();
  rightKeys.sort();

  if (!areIterablesEqual(leftKeys, rightKeys)) return false;

  return matchKeys(left, right, leftKeys, options);
}

function getAllKeys(target) {
  return [...Object.keys(target), ...Object.getOwnPropertySymbols(target)];
}

module.exports = deepEqual;
module.exports.MemoizeMap = MemoizeMap;
