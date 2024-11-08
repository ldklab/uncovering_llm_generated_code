// Filename: type-detect.js

(function(globalScope) {
  'use strict';

  /**
   * Accurately determines the type of a given value.
   *
   * @param {any} value - The value whose type is to be determined.
   * @returns {string} A string that represents the type of the input value.
   */
  function detectType(value) {
    const typeMap = Object.prototype.toString;
    const knownTypes = {
      '[object Array]': 'Array',
      '[object RegExp]': 'RegExp',
      '[object Function]': 'Function',
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

    if (value === null) {
      return 'null';
    }

    if (value === undefined) {
      return 'undefined';
    }

    const customTag = value[Symbol.toStringTag];
    if (typeof customTag === 'string') {
      return customTag;
    }

    const typeString = typeMap.call(value);
    return knownTypes[typeString] || typeof value;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = detectType;
  }

  // Define globally for browsers
  if (typeof window !== 'undefined') {
    window.detectType = detectType;
  }

  // Export for Deno
  if (typeof Deno !== 'undefined') {
    window.detectType = detectType;
  }

})(this);
