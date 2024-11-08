const clone = (() => {
  'use strict';

  function _instanceof(obj, type) {
    return type != null && obj instanceof type;
  }

  const nativeMap = typeof Map !== 'undefined' ? Map : function() {};
  const nativeSet = typeof Set !== 'undefined' ? Set : function() {};
  const nativePromise = typeof Promise !== 'undefined' ? Promise : function() {};

  function clone(parent, options = {}) {
    let { circular = true, depth = Infinity, prototype, includeNonEnumerable = false } = options;

    const allParents = [];
    const allChildren = [];
    const useBuffer = typeof Buffer !== 'undefined';

    function _clone(parent, depth) {
      if (parent === null) return null;
      if (depth === 0) return parent;

      if (typeof parent !== 'object') return parent;

      let child;
      if (_instanceof(parent, nativeMap)) {
        child = new nativeMap();
      } else if (_instanceof(parent, nativeSet)) {
        child = new nativeSet();
      } else if (_instanceof(parent, nativePromise)) {
        child = new nativePromise((resolve, reject) => {
          parent.then(value => resolve(_clone(value, depth - 1)), err => reject(_clone(err, depth - 1)));
        });
      } else if (clone.__isArray(parent)) {
        child = [];
      } else if (clone.__isRegExp(parent)) {
        child = new RegExp(parent.source, clone.__getRegExpFlags(parent));
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
        const proto = prototype === undefined ? Object.getPrototypeOf(parent) : prototype;
        child = Object.create(proto);
      }

      if (circular) {
        const index = allParents.indexOf(parent);
        if (index !== -1) return allChildren[index];
        allParents.push(parent);
        allChildren.push(child);
      }

      if (_instanceof(parent, nativeMap)) {
        parent.forEach((value, key) => {
          const keyChild = _clone(key, depth - 1);
          const valueChild = _clone(value, depth - 1);
          child.set(keyChild, valueChild);
        });
      }
      if (_instanceof(parent, nativeSet)) {
        parent.forEach(value => {
          const entryChild = _clone(value, depth - 1);
          child.add(entryChild);
        });
      }

      for (const i in parent) {
        const proto = child.__proto__;
        const attrs = proto ? Object.getOwnPropertyDescriptor(proto, i) : null;
        if (attrs && attrs.set == null) continue;
        child[i] = _clone(parent[i], depth - 1);
      }

      if (Object.getOwnPropertySymbols) {
        const symbols = Object.getOwnPropertySymbols(parent);
        for (const symbol of symbols) {
          const descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
          if (descriptor && !descriptor.enumerable && !includeNonEnumerable) continue;
          child[symbol] = _clone(parent[symbol], depth - 1);
          if (!descriptor.enumerable) {
            Object.defineProperty(child, symbol, { enumerable: false });
          }
        }
      }

      if (includeNonEnumerable) {
        const allPropertyNames = Object.getOwnPropertyNames(parent);
        for (const propertyName of allPropertyNames) {
          const descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);
          if (descriptor && descriptor.enumerable) continue;
          child[propertyName] = _clone(parent[propertyName], depth - 1);
          Object.defineProperty(child, propertyName, { enumerable: false });
        }
      }

      return child;
    }

    return _clone(parent, depth);
  }

  clone.clonePrototype = function(parent) {
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
    return (re.global ? 'g' : '') + (re.ignoreCase ? 'i' : '') + (re.multiline ? 'm' : '');
  }
  clone.__getRegExpFlags = __getRegExpFlags;

  return clone;
})();

if (typeof module === 'object' && module.exports) {
  module.exports = clone;
}
