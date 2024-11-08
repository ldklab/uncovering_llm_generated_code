// Filename: type-detect.js

(function(globalScope) {
  'use strict';

  /**
   * Accurately detects the type of a given value.
   *
   * @param {any} value - The value for which to detect the type.
   * @returns {string} A string indicating the type of the given value.
   */
  function typeDetect(value) {
    const nativeToString = Object.prototype.toString;
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
      '[object DataView]': 'DataView'
    };

    if (value === null) {
      return 'null';
    }

    if (value === undefined) {
      return 'undefined';
    }

    if (typeof value[Symbol.toStringTag] === 'string') {
      return value[Symbol.toStringTag];
    }

    const typeString = nativeToString.call(value);
    if (knownTypes.hasOwnProperty(typeString)) {
      return knownTypes[typeString];
    }

    return typeof value;
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = typeDetect;
  }

  // Global variable for Browser and Deno environments
  if (typeof window !== 'undefined' || typeof Deno !== 'undefined') {
    globalScope.typeDetect = typeDetect;
  }

})(this);
