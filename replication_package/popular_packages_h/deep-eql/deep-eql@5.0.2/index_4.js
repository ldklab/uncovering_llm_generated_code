function type(obj) {
  if (typeof obj === 'undefined') return 'undefined';
  if (obj === null) return 'null';

  const stringTag = obj[Symbol.toStringTag];
  if (typeof stringTag === 'string') return stringTag;
  return Object.prototype.toString.call(obj).slice(8, -1);
}

function FakeMap() {
  this._key = 'chai/deep-eql__' + Math.random() + Date.now();
}

FakeMap.prototype = {
  get(key) {
    return key[this._key];
  },
  set(key, value) {
    if (Object.isExtensible(key)) {
      Object.defineProperty(key, this._key, {
        value: value,
        configurable: true
      });
    }
  },
};

export const MemoizeMap = typeof WeakMap === 'function' ? WeakMap : FakeMap;

function memoizeCompare(left, right, memoizeMap) {
  if (!memoizeMap || isPrimitive(left) || isPrimitive(right)) return null;
  const leftHandMap = memoizeMap.get(left);
  if (leftHandMap) {
    const result = leftHandMap.get(right);
    if (typeof result === 'boolean') return result;
  }
  return null;
}

function memoizeSet(left, right, memoizeMap, result) {
  if (!memoizeMap || isPrimitive(left) || isPrimitive(right)) return;
  let leftHandMap = memoizeMap.get(left);
  if (leftHandMap) {
    leftHandMap.set(right, result);
  } else {
    leftHandMap = new MemoizeMap();
    leftHandMap.set(right, result);
    memoizeMap.set(left, leftHandMap);
  }
}

export default function deepEqual(leftHandOperand, rightHandOperand, options) {
  if (options && options.comparator) {
    return extensiveDeepEqual(leftHandOperand, rightHandOperand, options);
  }

  const simpleResult = simpleEqual(leftHandOperand, rightHandOperand);
  if (simpleResult !== null) return simpleResult;

  return extensiveDeepEqual(leftHandOperand, rightHandOperand, options);
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
  options = options || {};
  options.memoize = options.memoize === false ? false : options.memoize || new MemoizeMap();
  const comparator = options && options.comparator;

  const memoizeResultLeft = memoizeCompare(left, right, options.memoize);
  if (memoizeResultLeft !== null) return memoizeResultLeft;

  const memoizeResultRight = memoizeCompare(right, left, options.memoize);
  if (memoizeResultRight !== null) return memoizeResultRight;

  if (comparator) {
    const comparatorResult = comparator(left, right);
    if (comparatorResult === false || comparatorResult === true) {
      memoizeSet(left, right, options.memoize, comparatorResult);
      return comparatorResult;
    }
    const simpleResult = simpleEqual(left, right);
    if (simpleResult !== null) return simpleResult;
  }

  const leftHandType = type(left);
  if (leftHandType !== type(right)) {
    memoizeSet(left, right, options.memoize, false);
    return false;
  }

  memoizeSet(left, right, options.memoize, true);
  const result = extensiveDeepEqualByType(left, right, leftHandType, options);
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
  try {
    if (left.size !== right.size) return false;
    if (left.size === 0) return true;
  } catch (sizeError) {
    return false;
  }

  const leftItems = [];
  const rightItems = [];
  left.forEach((key, value) => leftItems.push([key, value]));
  right.forEach((key, value) => rightItems.push([key, value]));

  return iterableEqual(leftItems.sort(), rightItems.sort(), options);
}

function iterableEqual(left, right, options) {
  const length = left.length;
  if (length !== right.length) return false;
  if (length === 0) return true;
  
  for (let index = 0; index < length; index++) {
    if (deepEqual(left[index], right[index], options) === false) return false;
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
    } catch (iteratorError) {
      return [];
    }
  }
  return [];
}

function getGeneratorEntries(generator) {
  const accumulator = [];
  let generatorResult = generator.next();
  accumulator.push(generatorResult.value);
  while (!generatorResult.done) {
    generatorResult = generator.next();
    accumulator.push(generatorResult.value);
  }
  return accumulator;
}

function getEnumerableKeys(target) {
  return Object.keys(target).concat(getEnumerableSymbols(target));
}

function getEnumerableSymbols(target) {
  return Object.getOwnPropertySymbols(target).filter(sym => 
    Object.getOwnPropertyDescriptor(target, sym).enumerable);
}

function keysEqual(left, right, keys, options) {
  for (let i = 0; i < keys.length; i++) {
    if (!deepEqual(left[keys[i]], right[keys[i]], options)) return false;
  }
  return true;
}

function objectEqual(left, right, options) {
  const leftKeys = getEnumerableKeys(left);
  const rightKeys = getEnumerableKeys(right);

  if (leftKeys.length && leftKeys.length === rightKeys.length) {
    if (!iterableEqual(mapSymbols(leftKeys).sort(), mapSymbols(rightKeys).sort())) {
      return false;
    }
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
  return arr.map(entry => typeof entry === 'symbol' ? entry.toString() : entry);
}
