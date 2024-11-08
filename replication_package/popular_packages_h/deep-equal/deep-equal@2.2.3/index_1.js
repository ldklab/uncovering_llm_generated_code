'use strict';

// Importing necessary modules and functions
const assign = require('object.assign');
const callBound = require('call-bind/callBound');
const flags = require('regexp.prototype.flags');
const GetIntrinsic = require('get-intrinsic');
const getIterator = require('es-get-iterator');
const getSideChannel = require('side-channel');
const objectIs = require('object-is');
const isArguments = require('is-arguments');
const isArray = require('isarray');
const isArrayBuffer = require('is-array-buffer');
const isDate = require('is-date-object');
const isRegex = require('is-regex');
const isSharedArrayBuffer = require('is-shared-array-buffer');
const objectKeys = require('object-keys');
const whichBoxedPrimitive = require('which-boxed-primitive');
const whichCollection = require('which-collection');
const whichTypedArray = require('which-typed-array');
const byteLength = require('array-buffer-byte-length');

const sabByteLength = callBound('SharedArrayBuffer.prototype.byteLength', true);
const $getTime = callBound('Date.prototype.getTime');
const gPO = Object.getPrototypeOf;
const $objToString = callBound('Object.prototype.toString');

const $Set = GetIntrinsic('%Set%', true);
const $mapHas = callBound('Map.prototype.has', true);
const $mapGet = callBound('Map.prototype.get', true);
const $mapSize = callBound('Map.prototype.size', true);
const $setAdd = callBound('Set.prototype.add', true);
const $setDelete = callBound('Set.prototype.delete', true);
const $setHas = callBound('Set.prototype.has', true);
const $setSize = callBound('Set.prototype.size', true);

// Checks if a set contains a value deeply equal to a given one and removes it
function setHasEqualElement(set, val1, opts, channel) {
  const iterator = getIterator(set);
  let result;
  while ((result = iterator.next()) && !result.done) {
    if (internalDeepEqual(val1, result.value, opts, channel)) {
      $setDelete(set, result.value);
      return true;
    }
  }
  return false;
}

// Determines the loose matching primitive value
function findLooseMatchingPrimitives(prim) {
  if (typeof prim === 'undefined') return null;
  if (typeof prim === 'object') return void 0;
  if (typeof prim === 'symbol') return false;
  return typeof prim === 'string' || typeof prim === 'number' ? +prim === +prim : true;
}

// Checks if a map might have an element loosely matching a given primitive and item
function mapMightHaveLoosePrim(a, b, prim, item, opts, channel) {
  const altValue = findLooseMatchingPrimitives(prim);
  if (altValue != null) return altValue;
  const curB = $mapGet(b, altValue);
  const looseOpts = assign({}, opts, { strict: false });
  return !((typeof curB === 'undefined' && !$mapHas(b, altValue)) || !internalDeepEqual(item, curB, looseOpts, channel)) && !$mapHas(a, altValue) && internalDeepEqual(item, curB, looseOpts, channel);
}

// Checks if a set might have an element loosely matching a given primitive
function setMightHaveLoosePrim(a, b, prim) {
  const altValue = findLooseMatchingPrimitives(prim);
  if (altValue != null) return altValue;
  return $setHas(b, altValue) && !$setHas(a, altValue);
}

// Determines if a map contains an entry with a key and value equal to a given pair
function mapHasEqualEntry(set, map, key1, item1, opts, channel) {
  const iterator = getIterator(set);
  let result;
  while ((result = iterator.next()) && !result.done) {
    const key2 = result.value;
    if (internalDeepEqual(key1, key2, opts, channel) && internalDeepEqual(item1, $mapGet(map, key2), opts, channel)) {
      $setDelete(set, key2);
      return true;
    }
  }
  return false;
}

// Deep comparison function that handles internal logic for deep equality check
function internalDeepEqual(actual, expected, opts, channel) {
  opts = opts || {};

  if (opts.strict ? objectIs(actual, expected) : actual === expected) {
    return true;
  }

  const actualBoxed = whichBoxedPrimitive(actual);
  const expectedBoxed = whichBoxedPrimitive(expected);
  if (actualBoxed !== expectedBoxed) {
    return false;
  }

  if (!actual || !expected || (typeof actual !== 'object' && typeof expected !== 'object')) {
    return opts.strict ? objectIs(actual, expected) : actual == expected; // eslint-disable-line eqeqeq
  }

  const hasActual = channel.has(actual);
  const hasExpected = channel.has(expected);
  let sentinel;
  if (hasActual && hasExpected) {
    if (channel.get(actual) === channel.get(expected)) {
      return true;
    }
  } else {
    sentinel = {};
  }
  if (!hasActual) channel.set(actual, sentinel);
  if (!hasExpected) channel.set(expected, sentinel);

  return objEquiv(actual, expected, opts, channel);
}

// Checks if a value is a buffer
function isBuffer(x) {
  return x && typeof x === 'object' && typeof x.length === 'number' && typeof x.copy === 'function' && typeof x.slice === 'function' && (x.length === 0 || typeof x[0] === 'number') && !!(x.constructor && x.constructor.isBuffer && x.constructor.isBuffer(x));
}

// Determines if two sets are equivalent
function setEquiv(a, b, opts, channel) {
  if ($setSize(a) !== $setSize(b)) {
    return false;
  }
  const iteratorA = getIterator(a);
  const iteratorB = getIterator(b);
  let resultA;
  let resultB;
  let set;
  while ((resultA = iteratorA.next()) && !resultA.done) {
    if (resultA.value && typeof resultA.value === 'object') {
      if (!set) set = new $Set();
      $setAdd(set, resultA.value);
    } else if (!$setHas(b, resultA.value)) {
      if (opts.strict) return false;
      if (!setMightHaveLoosePrim(a, b, resultA.value)) {
        return false;
      }
      if (!set) set = new $Set();
      $setAdd(set, resultA.value);
    }
  }
  if (set) {
    while ((resultB = iteratorB.next()) && !resultB.done) {
      if (resultB.value && typeof resultB.value === 'object') {
        if (!setHasEqualElement(set, resultB.value, opts.strict, channel)) {
          return false;
        }
      } else if (!opts.strict && !$setHas(a, resultB.value) && !setHasEqualElement(set, resultB.value, opts.strict, channel)) {
        return false;
      }
    }
    return $setSize(set) === 0;
  }
  return true;
}

// Determines if two maps are equivalent
function mapEquiv(a, b, opts, channel) {
  if ($mapSize(a) !== $mapSize(b)) {
    return false;
  }
  const iteratorA = getIterator(a);
  const iteratorB = getIterator(b);
  let resultA;
  let resultB;
  let set;
  while ((resultA = iteratorA.next()) && !resultA.done) {
    const [key, item1] = resultA.value;
    if (key && typeof key === 'object') {
      if (!set) set = new $Set();
      $setAdd(set, key);
    } else {
      const item2 = $mapGet(b, key);
      if ((typeof item2 === 'undefined' && !$mapHas(b, key)) || !internalDeepEqual(item1, item2, opts, channel)) {
        if (opts.strict) {
          return false;
        }
        if (!mapMightHaveLoosePrim(a, b, key, item1, opts, channel)) {
          return false;
        }
        if (!set) set = new $Set();
        $setAdd(set, key);
      }
    }
  }

  if (set) {
    while ((resultB = iteratorB.next()) && !resultB.done) {
      const [key, item2] = resultB.value;
      if (key && typeof key === 'object') {
        if (!mapHasEqualEntry(set, a, key, item2, opts, channel)) {
          return false;
        }
      } else if (!opts.strict && (!a.has(key) || !internalDeepEqual($mapGet(a, key), item2, opts, channel)) && !mapHasEqualEntry(set, a, key, item2, assign({}, opts, { strict: false }), channel)) {
        return false;
      }
    }
    return $setSize(set) === 0;
  }
  return true;
}

// Compares two objects for deep equivalence
function objEquiv(a, b, opts, channel) {
  if (typeof a !== typeof b || a == null || b == null) {
    return false;
  }

  if ($objToString(a) !== $objToString(b)) {
    return false;
  }

  if (isArguments(a) !== isArguments(b)) {
    return false;
  }

  const aIsArray = isArray(a);
  const bIsArray = isArray(b);
  if (aIsArray !== bIsArray) {
    return false;
  }

  const aIsError = a instanceof Error;
  const bIsError = b instanceof Error;
  if (aIsError !== bIsError) {
    return false;
  }
  if (aIsError || bIsError) {
    if (a.name !== b.name || a.message !== b.message) {
      return false;
    }
  }

  const aIsRegex = isRegex(a);
  const bIsRegex = isRegex(b);
  if (aIsRegex !== bIsRegex) {
    return false;
  }
  if ((aIsRegex || bIsRegex) && (a.source !== b.source || flags(a) !== flags(b))) {
    return false;
  }

  const aIsDate = isDate(a);
  const bIsDate = isDate(b);
  if (aIsDate !== bIsDate) {
    return false;
  }
  if (aIsDate || bIsDate) {
    if ($getTime(a) !== $getTime(b)) {
      return false;
    }
  }

  if (opts.strict && gPO && gPO(a) !== gPO(b)) {
    return false;
  }

  const aWhich = whichTypedArray(a);
  const bWhich = whichTypedArray(b);
  if (aWhich !== bWhich) {
    return false;
  }
  if (aWhich || bWhich) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  const aIsBuffer = isBuffer(a);
  const bIsBuffer = isBuffer(b);
  if (aIsBuffer !== bIsBuffer) {
    return false;
  }
  if (aIsBuffer || bIsBuffer) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  const aIsArrayBuffer = isArrayBuffer(a);
  const bIsArrayBuffer = isArrayBuffer(b);
  if (aIsArrayBuffer !== bIsArrayBuffer) {
    return false;
  }
  if (aIsArrayBuffer || bIsArrayBuffer) {
    if (byteLength(a) !== byteLength(b)) {
      return false;
    }
    return typeof Uint8Array === 'function' && internalDeepEqual(new Uint8Array(a), new Uint8Array(b), opts, channel);
  }

  const aIsSAB = isSharedArrayBuffer(a);
  const bIsSAB = isSharedArrayBuffer(b);
  if (aIsSAB !== bIsSAB) {
    return false;
  }
  if (aIsSAB || bIsSAB) {
    if (sabByteLength(a) !== sabByteLength(b)) {
      return false;
    }
    return typeof Uint8Array === 'function' && internalDeepEqual(new Uint8Array(a), new Uint8Array(b), opts, channel);
  }

  if (typeof a !== typeof b) {
    return false;
  }

  const ka = objectKeys(a);
  const kb = objectKeys(b);
  if (ka.length !== kb.length) {
    return false;
  }

  ka.sort();
  kb.sort();
  for (let i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i]) {
      return false;
    }
  }

  for (let i = ka.length - 1; i >= 0; i--) {
    if (!internalDeepEqual(a[ka[i]], b[kb[i]], opts, channel)) {
      return false;
    }
  }

  const aCollection = whichCollection(a);
  const bCollection = whichCollection(b);
  if (aCollection !== bCollection) {
    return false;
  }
  if (aCollection === 'Set') {
    return setEquiv(a, b, opts, channel);
  }
  if (aCollection === 'Map') {
    return mapEquiv(a, b, opts, channel);
  }

  return true;
}

// Exporting the deepEqual function
module.exports = function deepEqual(a, b, opts) {
  return internalDeepEqual(a, b, opts, getSideChannel());
};
