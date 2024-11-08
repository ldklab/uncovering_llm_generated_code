// Filename: type-detect.js

(function(globalContext) {
  'use strict';

  /**
   * Identifies the type of a given value with improved precision.
   *
   * @param {any} value - The value whose type is to be determined.
   * @returns {string} The type of the given value as a string.
   */
  function typeDetect(value) {
    const toString = Object.prototype.toString;
    const knownTypes = {
      '[object Array]': 'Array',
      '[object RegExp]': 'RegExp',
      '[object Function]': 'function',
      '[object Arguments]': 'Arguments',
      '[object Date]': 'Date',
      '[object Number]': 'Number',
      '[object String]': 'String',
      '[object Null]': 'null',
      '[object Undefined]': 'undefined',
      '[object Object]': 'Object',
      '[object Map]': 'Map',
      '[object WeakMap]': 'WeakMap',
      '[object Set]': 'Set',
      '[object WeakSet]': 'WeakSet',
      '[object Symbol]': 'symbol',
      '[object Promise]': 'Promise',
      '[object Int8Array]': 'Int8Array',
      '[object Uint8Array]': 'Uint8Array',
      '[object Uint8ClampedArray]': 'Uint8ClampedArray',
      '[object Int16Array]': 'Int16Array',
      '[object Uint16Array]': 'Uint16Array',
      '[object Int32Array]': 'Int32Array',
      '[object Uint32Array]': 'Uint32Array',
      '[object Float32Array]': 'Float32Array',
      '[object Float64Array]': 'Float64Array',
      '[object ArrayBuffer]': 'ArrayBuffer',
      '[object DataView]': 'DataView',
    };

    if (value === null) return 'null';
    if (value === undefined) return 'undefined';

    const symbolTag = value[Symbol.toStringTag];
    if (typeof symbolTag === 'string') return symbolTag;

    const typeTag = toString.call(value);
    if (knownTypes.hasOwnProperty(typeTag)) return knownTypes[typeTag];

    return typeof value;
  }

  // Determine export based on environment
  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = typeDetect; // Export for Node.js
  } else if (typeof window !== 'undefined') {
    window.typeDetect = typeDetect; // Global for browser
  } else if (typeof Deno !== 'undefined') {
    window.typeDetect = typeDetect; // Global for Deno
  }

})(this);
