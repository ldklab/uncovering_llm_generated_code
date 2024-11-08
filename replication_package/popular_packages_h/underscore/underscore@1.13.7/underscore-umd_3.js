(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define('underscore', factory);
  } else {
    var _oldUnderscore = global._;
    var _underscore = factory();
    _underscore.noConflict = function() {
      global._ = _oldUnderscore;
      return _underscore;
    };
    global._ = _underscore;
  }
}(this, function () {
  var VERSION = '1.13.7';  // Current Underscore.js version

  var root = (typeof self === 'object' && self.self === self && self) ||
             (typeof global === 'object' && global.global === global && global) ||
             Function('return this')() || {};

  var ArrayProto = Array.prototype, ObjProto = Object.prototype;
  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeCreate = Object.create,
      nativeIsView = ArrayBuffer && ArrayBuffer.isView;

  var _isNaN = isNaN, _isFinite = isFinite;

  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

  function restArguments(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    return function() {
      var length = Math.max(arguments.length - startIndex, 0), rest = Array(length), index = 0;
      for (; index < length; index++) {
        rest[index] = arguments[index + startIndex];
      }
      switch (startIndex) {
        case 0: return func.call(this, rest);
        case 1: return func.call(this, arguments[0], rest);
        case 2: return func.call(this, arguments[0], arguments[1], rest);
      }
      var args = Array(startIndex + 1);
      for (index = 0; index < startIndex; index++) {
        args[index] = arguments[index];
      }
      args[startIndex] = rest;
      return func.apply(this, args);
    };
  }

  function isObject(obj) {
    var type = typeof obj;
    return type === 'function' || (type === 'object' && !!obj);
  }

  function keys(obj) {
    if (!isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (hasOwnProperty.call(obj, key)) keys.push(key);
    return keys;
  }

  function values(obj) {
    var _keys = keys(obj);
    var length = _keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[_keys[i]];
    }
    return values;
  }

  function each(obj, iteratee) {
    var i, length;
    if (Array.isArray(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var _keys = keys(obj);
      for (i = 0, length = _keys.length; i < length; i++) {
        iteratee(obj[_keys[i]], _keys[i], obj);
      }
    }
    return obj;
  }

  var _ = {
    VERSION: VERSION,
    restArguments: restArguments,
    isObject: isObject,
    keys: keys,
    values: values,
    each: each
    // Provide more utility functions as needed
  };

  return _;
}));
