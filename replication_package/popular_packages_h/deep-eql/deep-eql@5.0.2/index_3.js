/* globals Symbol: false, Uint8Array: false, WeakMap: false */
/*!
 * deep-eql
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

function type(obj) {
  if (typeof obj === 'undefined') return 'undefined';
  if (obj === null) return 'null';
  const stringTag = obj[Symbol.toStringTag];
  if (typeof stringTag === 'string') return stringTag;
  return Object.prototype.toString.call(obj).slice(8, -1);
}

class FakeMap {
  constructor() {
    this._key = 'chai/deep-eql__' + Math.random() + Date.now();
  }
  get(key) { return key[this._key]; }
  set(key, value) {
    if (Object.isExtensible(key)) {
      Object.defineProperty(key, this._key, { value, configurable: true });
    }
  }
}

export const MemoizeMap = typeof WeakMap === 'function' ? WeakMap : FakeMap;

function memoizeCompare(leftHand, rightHand, memoizeMap) {
  if (!memoizeMap || isPrimitive(leftHand) || isPrimitive(rightHand)) return null;
  const leftMap = memoizeMap.get(leftHand);
  if (leftMap) {
    const result = leftMap.get(rightHand);
    if (typeof result === 'boolean') return result;
  }
  return null;
}

function memoizeSet(leftHand, rightHand, memoizeMap, result) {
  if (!memoizeMap || isPrimitive(leftHand) || isPrimitive(rightHand)) return;
  let leftMap = memoizeMap.get(leftHand);
  if (leftMap) {
    leftMap.set(rightHand, result);
  } else {
    leftMap = new MemoizeMap();
    leftMap.set(rightHand, result);
    memoizeMap.set(leftHand, leftMap);
  }
}

export default function deepEqual(leftHand, rightHand, options) {
  if (options && options.comparator) {
    return extensiveDeepEqual(leftHand, rightHand, options);
  }

  const simpleResult = simpleEqual(leftHand, rightHand);
  if (simpleResult !== null) return simpleResult;

  return extensiveDeepEqual(leftHand, rightHand, options);
}

function simpleEqual(leftHand, rightHand) {
  if (leftHand === rightHand) {
    return leftHand !== 0 || 1 / leftHand === 1 / rightHand;
  }
  if (leftHand !== leftHand && rightHand !== rightHand) return true;
  if (isPrimitive(leftHand) || isPrimitive(rightHand)) return false;
  return null;
}

function extensiveDeepEqual(leftHand, rightHand, options) {
  options = options || { memoize: new MemoizeMap() };
  options.memoize = options.memoize === false ? false : options.memoize || new MemoizeMap();

  const memoizeResultLeft = memoizeCompare(leftHand, rightHand, options.memoize);
  if (memoizeResultLeft !== null) return memoizeResultLeft;
  const memoizeResultRight = memoizeCompare(rightHand, leftHand, options.memoize);
  if (memoizeResultRight !== null) return memoizeResultRight;

  const comparator = options.comparator;
  if (comparator) {
    const result = comparator(leftHand, rightHand);
    if (result === false || result === true) {
      memoizeSet(leftHand, rightHand, options.memoize, result);
      return result;
    }
    const simpleResult = simpleEqual(leftHand, rightHand);
    if (simpleResult !== null) return simpleResult;
  }

  const leftType = type(leftHand);
  if (leftType !== type(rightHand)) {
    memoizeSet(leftHand, rightHand, options.memoize, false);
    return false;
  }

  memoizeSet(leftHand, rightHand, options.memoize, true);

  const result = extensiveDeepEqualByType(leftHand, rightHand, leftType, options);
  memoizeSet(leftHand, rightHand, options.memoize, result);
  return result;
}

function extensiveDeepEqualByType(leftHand, rightHand, leftType, options) {
  switch (leftType) {
    case 'String': case 'Number': case 'Boolean': case 'Date':
      return deepEqual(leftHand.valueOf(), rightHand.valueOf());
    case 'Promise': case 'Symbol': case 'function': case 'WeakMap': case 'WeakSet':
      return leftHand === rightHand;
    case 'Error':
      return keysEqual(leftHand, rightHand, ['name', 'message', 'code'], options);
    case 'Arguments': case 'Int8Array': case 'Uint8Array': case 'Uint8ClampedArray':
    case 'Int16Array': case 'Uint16Array': case 'Int32Array': case 'Uint32Array':
    case 'Float32Array': case 'Float64Array': case 'Array':
      return iterableEqual(leftHand, rightHand, options);
    case 'RegExp': return regexpEqual(leftHand, rightHand);
    case 'Generator': return generatorEqual(leftHand, rightHand, options);
    case 'DataView':
      return iterableEqual(new Uint8Array(leftHand.buffer), new Uint8Array(rightHand.buffer), options);
    case 'ArrayBuffer':
      return iterableEqual(new Uint8Array(leftHand), new Uint8Array(rightHand), options);
    case 'Set': case 'Map':
      return entriesEqual(leftHand, rightHand, options);
    case 'Temporal.PlainDate': case 'Temporal.PlainTime': case 'Temporal.PlainDateTime':
    case 'Temporal.Instant': case 'Temporal.ZonedDateTime': case 'Temporal.PlainYearMonth':
    case 'Temporal.PlainMonthDay':
      return leftHand.equals(rightHand);
    case 'Temporal.Duration':
      return leftHand.total('nanoseconds') === rightHand.total('nanoseconds');
    case 'Temporal.TimeZone': case 'Temporal.Calendar':
      return leftHand.toString() === rightHand.toString();
    default:
      return objectEqual(leftHand, rightHand, options);
  }
}

function regexpEqual(leftHand, rightHand) {
  return leftHand.toString() === rightHand.toString();
}

function entriesEqual(leftHand, rightHand, options) {
  if (leftHand.size !== rightHand.size) return false;
  const leftItems = Array.from(leftHand).sort();
  const rightItems = Array.from(rightHand).sort();
  return iterableEqual(leftItems, rightItems, options);
}

function iterableEqual(leftHand, rightHand, options) {
  if (leftHand.length !== rightHand.length) return false;
  for (let i = 0; i < leftHand.length; i++) {
    if (!deepEqual(leftHand[i], rightHand[i], options)) return false;
  }
  return true;
}

function generatorEqual(leftHand, rightHand, options) {
  return iterableEqual(getGeneratorEntries(leftHand), getGeneratorEntries(rightHand), options);
}

function hasIteratorFunction(target) {
  return typeof Symbol !== 'undefined' && typeof target === 'object' &&
    typeof Symbol.iterator !== 'undefined' && typeof target[Symbol.iterator] === 'function';
}

function getIteratorEntries(target) {
  if (hasIteratorFunction(target)) {
    return getGeneratorEntries(target[Symbol.iterator]());
  }
  return [];
}

function getGeneratorEntries(generator) {
  const entries = [];
  for (let entry of generator) {
    entries.push(entry);
  }
  return entries;
}

function getEnumerableKeys(target) {
  return Object.keys(target).concat(Object.getOwnPropertySymbols(target).filter(sym => 
    Object.getOwnPropertyDescriptor(target, sym).enumerable));
}

function keysEqual(leftHand, rightHand, keys, options) {
  return keys.every(key => deepEqual(leftHand[key], rightHand[key], options));
}

function objectEqual(leftHand, rightHand, options) {
  const leftKeys = getEnumerableKeys(leftHand);
  const rightKeys = getEnumerableKeys(rightHand);
  if (leftKeys.length !== rightKeys.length || !iterableEqual(leftKeys.sort(), rightKeys.sort())) return false;
  return keysEqual(leftHand, rightHand, leftKeys, options);
}

function isPrimitive(value) {
  return value === null || (typeof value !== 'object' && typeof value !== 'function');
}

function mapSymbols(arr) {
  return arr.map(entry => typeof entry === 'symbol' ? entry.toString() : entry);
}
