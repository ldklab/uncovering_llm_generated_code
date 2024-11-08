'use strict';

const randomBytes = require('randombytes');

const UID_LENGTH = 16;
const UID = generateUID();
const PLACEHOLDER_REGEX = new RegExp(
  '(\\\\)?"@__(F|R|D|M|S|A|U|I|B|L)-' + UID + '-(\\d+)__@"',
  'g'
);

const IS_NATIVE_CODE_REGEX = /\{\s*\[native code\]\s*\}/;
const IS_PURE_FUNCTION = /function.*?\(/;
const IS_ARROW_FUNCTION = /.*?=>.*?/;
const UNSAFE_CHARS_REGEX = /[<>\/\u2028\u2029]/g;

const RESERVED_SYMBOLS = ['*', 'async'];

const ESCAPED_CHARS = {
  '<': '\\u003C',
  '>': '\\u003E',
  '/': '\\u002F',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029'
};

function escapeUnsafeChars(unsafeChar) {
  return ESCAPED_CHARS[unsafeChar];
}

function generateUID() {
  const bytes = randomBytes(UID_LENGTH);
  return Array.from(bytes, byte => byte.toString(16)).join('');
}

function deleteFunctions(obj) {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'function') {
      delete obj[key];
    }
  });
}

module.exports = function serialize(obj, options = {}) {
  if (typeof options === 'number' || typeof options === 'string') {
    options = { space: options };
  }

  const functions = [],
    regexps = [],
    dates = [],
    maps = [],
    sets = [],
    arrays = [],
    undefs = [],
    infinities = [],
    bigInts = [],
    urls = [];

  function replacer(key, value) {
    if (options.ignoreFunction) {
      deleteFunctions(value);
    }
    if (value === null || typeof value === 'boolean' || typeof value === 'string' || typeof value === 'number') {
      return value;
    }

    const origValue = this[key];
    const type = typeof origValue;

    switch (type) {
      case 'object':
        if (origValue instanceof RegExp) {
          return `@__R-${UID}-${regexps.push(origValue) - 1}__@`;
        }
        if (origValue instanceof Date) {
          return `@__D-${UID}-${dates.push(origValue) - 1}__@`;
        }
        if (origValue instanceof Map) {
          return `@__M-${UID}-${maps.push(origValue) - 1}__@`;
        }
        if (origValue instanceof Set) {
          return `@__S-${UID}-${sets.push(origValue) - 1}__@`;
        }
        if (Array.isArray(origValue)) {
          const isSparse = origValue.some((_, i) => !(i in origValue));
          if (isSparse) {
            return `@__A-${UID}-${arrays.push(origValue) - 1}__@`;
          }
        }
        if (origValue instanceof URL) {
          return `@__L-${UID}-${urls.push(origValue) - 1}__@`;
        }
        break;
      case 'function':
        return `@__F-${UID}-${functions.push(origValue) - 1}__@`;
      case 'undefined':
        return `@__U-${UID}-${undefs.push(undefined) - 1}__@`;
      case 'number':
        if (!isFinite(origValue)) {
          return `@__I-${UID}-${infinities.push(origValue) - 1}__@`;
        }
        break;
      case 'bigint':
        return `@__B-${UID}-${bigInts.push(origValue) - 1}__@`;
    }

    return value;
  }

  function serializeFunc(fn) {
    const serializedFn = fn.toString();
    if (IS_NATIVE_CODE_REGEX.test(serializedFn)) {
      throw new TypeError('Serializing native function: ' + fn.name);
    }

    if (IS_PURE_FUNCTION.test(serializedFn) || IS_ARROW_FUNCTION.test(serializedFn)) {
      return serializedFn;
    }

    const argsStartsAt = serializedFn.indexOf('(');
    const def = serializedFn.slice(0, argsStartsAt).trim().split(/\s+/);
    const isAsync = def.includes('async');
    const hasAsterisk = def.includes('*');

    const funcType = isAsync ? 'async function' : 'function';
    const star = hasAsterisk ? '*' : '';

    return `${funcType}${star}${serializedFn.slice(argsStartsAt)}`;
  }

  if (options.ignoreFunction && typeof obj === 'function') {
    obj = undefined;
  }

  if (obj === undefined) {
    return 'undefined';
  }

  let str = JSON.stringify(obj, options.isJSON ? null : replacer, options.space);

  if (typeof str !== 'string') {
    return String(str);
  }

  if (!options.unsafe) {
    str = str.replace(UNSAFE_CHARS_REGEX, escapeUnsafeChars);
  }

  if (
    functions.length === 0 &&
    regexps.length === 0 &&
    dates.length === 0 &&
    maps.length === 0 &&
    sets.length === 0 &&
    arrays.length === 0 &&
    undefs.length === 0 &&
    infinities.length === 0 &&
    bigInts.length === 0 &&
    urls.length === 0
  ) {
    return str;
  }

  return str.replace(PLACEHOLDER_REGEX, (match, backSlash, type, valueIndex) => {
    if (backSlash) {
      return match;
    }
    switch (type) {
      case 'D':
        return `new Date("${dates[valueIndex].toISOString()}")`;
      case 'R':
        return `new RegExp(${serialize(regexps[valueIndex].source)}, "${regexps[valueIndex].flags}")`;
      case 'M':
        return `new Map(${serialize(Array.from(maps[valueIndex].entries()), options)})`;
      case 'S':
        return `new Set(${serialize(Array.from(sets[valueIndex]), options)})`;
      case 'A':
        return `Array.prototype.slice.call(${serialize(Object.assign({ length: arrays[valueIndex].length }, arrays[valueIndex]), options)})`;
      case 'U':
        return 'undefined';
      case 'I':
        return infinities[valueIndex];
      case 'B':
        return `BigInt("${bigInts[valueIndex]}")`;
      case 'L':
        return `new URL(${serialize(urls[valueIndex].toString(), options)})`;
      case 'F':
        return serializeFunc(functions[valueIndex]);
    }
  });
};
