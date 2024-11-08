(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define('underscore', factory);
  } else {
    // Global variable
    const previousUnderscore = root._;
    const underscore = root._ = factory();
    underscore.noConflict = function () {
      root._ = previousUnderscore;
      return underscore;
    };
  }
}(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : typeof global !== 'undefined' ? global : this, function () {
  'use strict';

  // Version
  const VERSION = '1.13.7';

  // Helper variables
  const ArrayProto = Array.prototype;
  const ObjProto = Object.prototype;
  const SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

  // Quick reference variables
  const push = ArrayProto.push;
  const slice = ArrayProto.slice;
  const toString = ObjProto.toString;
  const hasOwnProperty = ObjProto.hasOwnProperty;

  // Feature detection
  const supportsArrayBuffer = typeof ArrayBuffer !== 'undefined';
  const supportsDataView = typeof DataView !== 'undefined';

  // Native implementations
  const nativeIsArray = Array.isArray;
  const nativeKeys = Object.keys;
  const nativeCreate = Object.create;
  const nativeIsView = supportsArrayBuffer && ArrayBuffer.isView;

  // LODASH LIBRARY
  // Add all utility functions and logic here

  // Export the public API
  const _ = function (obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  _.VERSION = VERSION;

  // Add methods to the prototype
  _.prototype.value = function () {
    return this._wrapped;
  };

  // Define root methods like noConflict, extend, and others here

  // Expose the library
  return _;
}));
//# sourceMappingURL=underscore-umd.js.map
