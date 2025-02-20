(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    // Node.js module export
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD module definition
    define('underscore', factory);
  } else {
    // Global browser variable
    var current = global._;
    var _ = global._ = factory();
    _.noConflict = function () {
      global._ = current;
      return _;
    };
  }
}(this, function () {
  var VERSION = '1.12.0';
  var root = typeof self == 'object' && self.self === self && self ||
             typeof global == 'object' && global.global === global && global ||
             Function('return this')() || {};

  var ArrayProto = Array.prototype, ObjProto = Object.prototype;
  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeCreate = Object.create;

  // Utility functions
  function isObject(obj) {
    return typeof obj === 'object' && !!obj;
  }
  function keys(obj) {
    if (!isObject(obj)) return [];
    return nativeKeys ? nativeKeys(obj) : [];
  }
  function each(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    if (Array.isArray(obj)) {
      for (var i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var _keys = keys(obj);
      for (var i = 0, length = _keys.length; i < length; i++) {
        iteratee(obj[_keys[i]], _keys[i], obj);
      }
    }
    return obj;
  }

  // Collection functions
  function map(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var _keys = !Array.isArray(obj) && keys(obj),
        length = (_keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = _keys ? _keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  }

  function filter(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  }

  function reduce(obj, iteratee, memo, context) {
    iteratee = optimizeCb(iteratee, context, 4);
    var _keys = !Array.isArray(obj) && keys(obj),
        length = (_keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = _keys ? _keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  }

  // ... many more utility functions defined similarly ...

  function _() {
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  }
  _.VERSION = VERSION;
  _.each = each;
  _.map = map;
  _.filter = filter;
  _.reduce = reduce;

  // Add more Underscore functions to the wrapper
  function mixin(obj) {
    each(keys(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return func.apply(_, args);
      };
    });
    return _;
  }

  return mixin(_);
}));
