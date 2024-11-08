const clone = (function() {
  'use strict';

  function _instanceof(obj, type) {
    return type != null && obj instanceof type;
  }

  const nativeMap = typeof Map !== 'undefined' ? Map : function() {};
  const nativeSet = typeof Set !== 'undefined' ? Set : function() {};
  const nativePromise = typeof Promise !== 'undefined' ? Promise : function() {};

  function clone(parent, circular = true, depth = Infinity, prototype, includeNonEnumerable = false) {
    const allParents = [];
    const allChildren = [];
    const useBuffer = typeof Buffer !== 'undefined';

    function _clone(parent, depth) {
      if (parent === null || depth === 0 || typeof parent !== 'object') return parent;

      let child, proto;

      if (_instanceof(parent, nativeMap)) {
        child = new nativeMap();
        parent.forEach((value, key) => {
          child.set(_clone(key, depth - 1), _clone(value, depth - 1));
        });
      } else if (_instanceof(parent, nativeSet)) {
        child = new nativeSet();
        parent.forEach(value => child.add(_clone(value, depth - 1)));
      } else if (_instanceof(parent, nativePromise)) {
        child = new nativePromise((resolve, reject) => {
          parent.then(value => resolve(_clone(value, depth - 1)), err => reject(_clone(err, depth - 1)));
        });
      } else if (clone.__isArray(parent)) {
        child = parent.map(item => _clone(item, depth - 1));
      } else if (clone.__isRegExp(parent)) {
        child = new RegExp(parent.source, __getRegExpFlags(parent));
        if (parent.lastIndex) child.lastIndex = parent.lastIndex;
      } else if (clone.__isDate(parent)) {
        child = new Date(parent.getTime());
      } else if (useBuffer && Buffer.isBuffer(parent)) {
        child = Buffer.allocUnsafe ? Buffer.allocUnsafe(parent.length) : new Buffer(parent.length);
        parent.copy(child);
        return child;
      } else if (_instanceof(parent, Error)) {
        child = Object.create(parent);
      } else {
        proto = prototype || Object.getPrototypeOf(parent);
        child = Object.create(proto);
      }

      if (circular) {
        const index = allParents.indexOf(parent);
        if (index !== -1) return allChildren[index];
        allParents.push(parent);
        allChildren.push(child);
      }

      Object.keys(parent).forEach(key => {
        child[key] = _clone(parent[key], depth - 1);
      });

      if (Object.getOwnPropertySymbols) {
        Object.getOwnPropertySymbols(parent).forEach(symbol => {
          const descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
          if (!descriptor.enumerable && !includeNonEnumerable) return;
          child[symbol] = _clone(parent[symbol], depth - 1);
          if (!descriptor.enumerable) Object.defineProperty(child, symbol, { enumerable: false });
        });
      }

      if (includeNonEnumerable) {
        Object.getOwnPropertyNames(parent).forEach(prop => {
          const descriptor = Object.getOwnPropertyDescriptor(parent, prop);
          if (!descriptor.enumerable) {
            child[prop] = _clone(parent[prop], depth - 1);
            Object.defineProperty(child, prop, { enumerable: false });
          }
        });
      }

      return child;
    }

    return _clone(parent, depth);
  }

  clone.clonePrototype = function clonePrototype(parent) {
    if (parent === null) return null;
    const c = function() {};
    c.prototype = parent;
    return new c();
  };

  function __objToStr(o) {
    return Object.prototype.toString.call(o);
  }
  clone.__objToStr = __objToStr;

  function __isDate(o) {
    return typeof o === 'object' && __objToStr(o) === '[object Date]';
  }
  clone.__isDate = __isDate;

  function __isArray(o) {
    return typeof o === 'object' && __objToStr(o) === '[object Array]';
  }
  clone.__isArray = __isArray;

  function __isRegExp(o) {
    return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
  }
  clone.__isRegExp = __isRegExp;

  function __getRegExpFlags(re) {
    let flags = '';
    if (re.global) flags += 'g';
    if (re.ignoreCase) flags += 'i';
    if (re.multiline) flags += 'm';
    return flags;
  }
  clone.__getRegExpFlags = __getRegExpFlags;

  return clone;
})();

if (typeof module === 'object' && module.exports) {
  module.exports = clone;
}
