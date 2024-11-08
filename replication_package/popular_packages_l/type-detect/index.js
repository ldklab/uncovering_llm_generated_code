// Filename: type-detect.js

(function(global) {
  'use strict';

  /**
   * Determines the type of a value with improved accuracy.
   *
   * @param {any} obj - The value to determine the type of.
   * @returns {string} A string representing the type of the given value.
   */
  function typeDetect(obj) {
    const toString = Object.prototype.toString;
    const objectTypes = {
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
      '[object DataView]': 'DataView'
    };

    if (obj === null) {
      return 'null';
    }

    if (obj === undefined) {
      return 'undefined';
    }

    const tag = obj[Symbol.toStringTag];
    if (typeof tag === 'string') {
      return tag;
    }

    const str = toString.call(obj);
    if (objectTypes.hasOwnProperty(str)) {
      return objectTypes[str];
    }

    return typeof obj;
  }

  // Node.js exports
  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = typeDetect;
  }

  // Browser global
  if (typeof window !== 'undefined') {
    window.typeDetect = typeDetect;
  }

  // Deno export
  if (typeof Deno !== 'undefined') {
    window.typeDetect = typeDetect;
  }

})(this);
