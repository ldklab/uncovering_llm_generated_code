/* globals Symbol: false, Uint8Array: false, WeakMap: false */
/*!
 * deep-eql
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

function getType(obj) {
  if (typeof obj === 'undefined') return 'undefined';
  if (obj === null) return 'null';
  const stringTag = obj[Symbol.toStringTag];
  if (typeof stringTag === 'string') return stringTag;
  return Object.prototype.toString.call(obj).slice(8, -1);
}

class FakeMap {
  constructor() {
    this._key = `chai/deep-eql__${Math.random()}${Date.now()}`;
  }

  get(key) {
    return key[this._key];
  }

  set(key, value) {
    if (Object.isExtensible(key)) {
      Object.defineProperty(key, this._key, { value, configurable: true });
    }
  }
}

export var MemoizeMap = typeof WeakMap === 'function' ? WeakMap : FakeMap;

function memoizeCompare(left, right, map) {
  if (!map || isPrimitive(left) || isPrimitive(right)) return null;
  const leftMap = map.get(left);
  if (leftMap) {
    const result = leftMap.get(right);
    if (typeof result === 'boolean') return result;
  }
  return null;
}

function memoizeSet(left, right, map, result) {
  if (!map || isPrimitive(left) || isPrimitive(right)) return;
  let leftMap = map.get(left);
  if (leftMap) {
    leftMap.set(right, result);
  } else {
    leftMap = new MemoizeMap();
    leftMap.set(right, result);
    map.set(left, leftMap);
  }
}

export default function deepEqual(left, right, options = {}) {
  if (options.comparator) {
    return extensiveDeepEqual(left, right, options);
  }

  const simpleResult = simpleEqual(left, right);
  if (simpleResult !== null) return simpleResult;

  return extensiveDeepEqual(left, right, options);
}

function simpleEqual(left, right) {
  if (left === right) {
    return left !== 0 || 1 / left === 1 / right;
  }
  if (left !== left && right !== right) return true;
  if (isPrimitive(left) || isPrimitive(right)) return false;
  return null;
}

function extensiveDeepEqual(left, right, options) {
  options.memoize = options.memoize === false ? false : options.memoize || new MemoizeMap();
  const comparator = options.comparator;

  const resultLeft = memoizeCompare(left, right, options.memoize);
  if (resultLeft !== null) return resultLeft;
  const resultRight = memoizeCompare(right, left, options.memoize);
  if (resultRight !== null) return resultRight;

  if (comparator) {
    const comparatorResult = comparator(left, right);
    if (comparatorResult !== null) {
      memoizeSet(left, right, options.memoize, comparatorResult);
      return comparatorResult;
    }
    const simpleResult = simpleEqual(left, right);
    if (simpleResult !== null) return simpleResult;
  }

  const leftType = getType(left);
  if (leftType !== getType(right)) {
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
      return keysEqual(left, right, [ 'name', 'message', 'code' ], options);
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
    case 'Temporal.PlainDate':
    case 'Temporal.PlainTime':
    case 'Temporal.PlainDateTime':
    case 'Temporal.Instant':
    case 'Temporal.ZonedDateTime':
    case 'Temporal.PlainYearMonth':
    case 'Temporal.PlainMonthDay':
      return left.equals(right);
    case 'Temporal.Duration':
      return left.total('nanoseconds') === right.total('nanoseconds');
    case 'Temporal.TimeZone':
    case 'Temporal.Calendar':
      return left.toString() === right.toString();
    default:
      return objectEqual(left, right, options);
  }
}

function regexpEqual(left, right) {
  return left.toString() === right.toString();
}

function entriesEqual(left, right, options) {
  if (left.size !== right.size) return false;
  if (left.size === 0) return true;

  const leftItems = [], rightItems = [];
  left.forEach((value, key) => leftItems.push([key, value]));
  right.forEach((value, key) => rightItems.push([key, value]));
  return iterableEqual(leftItems.sort(), rightItems.sort(), options);
}

function iterableEqual(left, right, options) {
  const length = left.length;
  if (length !== right.length) return false;
  if (length === 0) return true;
  for (let i = 0; i < length; i++) {
    if (!deepEqual(left[i], right[i], options)) return false;
  }
  return true;
}

function generatorEqual(left, right, options) {
  return iterableEqual(getGeneratorEntries(left), getGeneratorEntries(right), options);
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
  const entries = [];
  let result = generator.next();
  while (!result.done) {
    entries.push(result.value);
    result = generator.next();
  }
  return entries;
}

function getEnumerableKeys(target) {
  return Object.keys(target);
}

function getEnumerableSymbols(target) {
  return Object.getOwnPropertySymbols(target).filter(symbol =>
    Object.getOwnPropertyDescriptor(target, symbol).enumerable
  );
}

function keysEqual(left, right, keys, options) {
  return keys.every(key => deepEqual(left[key], right[key], options));
}

function objectEqual(left, right, options) {
  const leftKeys = [...getEnumerableKeys(left), ...getEnumerableSymbols(left)];
  const rightKeys = [...getEnumerableKeys(right), ...getEnumerableSymbols(right)];

  if (leftKeys.length && leftKeys.length === rightKeys.length) {
    if (!iterableEqual(leftKeys.sort(), rightKeys.sort())) return false;
    return keysEqual(left, right, leftKeys, options);
  }

  const leftEntries = getIteratorEntries(left);
  const rightEntries = getIteratorEntries(right);
  if (leftEntries.length && leftEntries.length === rightEntries.length) {
    return iterableEqual(leftEntries.sort(), rightEntries.sort(), options);
  }

  return leftKeys.length === 0 && leftEntries.length === 0 &&
         rightKeys.length === 0 && rightEntries.length === 0;
}

function isPrimitive(value) {
  return value === null || typeof value !== 'object';
}

function mapSymbols(arr) {
  return arr.map(entry => (typeof entry === 'symbol' ? entry.toString() : entry));
}
