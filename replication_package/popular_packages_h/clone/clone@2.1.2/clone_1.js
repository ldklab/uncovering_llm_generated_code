const clone = (function() {
  'use strict';

  const _instanceof = (obj, type) => type != null && obj instanceof type;

  let nativeMap = typeof Map !== 'undefined' ? Map : function() {};
  let nativeSet = typeof Set !== 'undefined' ? Set : function() {};
  let nativePromise = typeof Promise !== 'undefined' ? Promise : function() {};

  function clone(parent, circular = true, depth = Infinity, prototype, includeNonEnumerable = false) {
    if (typeof circular === 'object') {
      ({ circular, depth, prototype, includeNonEnumerable } = circular);
    }
    
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
        child = new RegExp(parent.source, _getRegExpFlags(parent));
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
        let proto = prototype || Object.getPrototypeOf(parent);
        child = Object.create(proto);
      }

      if (circular) {
        const index = allParents.indexOf(parent);
        if (index !== -1) return allChildren[index];
        allParents.push(parent);
        allChildren.push(child);
      }

      if (_instanceof(parent, nativeMap)) {
        parent.forEach((value, key) => child.set(_clone(key, depth - 1), _clone(value, depth - 1)));
      }
      if (_instanceof(parent, nativeSet)) {
        parent.forEach(value => child.add(_clone(value, depth - 1)));
      }

      for (let i in parent) {
        if (prototype && !Object.getOwnPropertyDescriptor(prototype, i)?.set) continue;
        child[i] = _clone(parent[i], depth - 1);
      }

      if (Object.getOwnPropertySymbols) {
        Object.getOwnPropertySymbols(parent).forEach(symbol => {
          const descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
          if (!descriptor?.enumerable && !includeNonEnumerable) return;
          child[symbol] = _clone(parent[symbol], depth - 1);
          if (!descriptor.enumerable) Object.defineProperty(child, symbol, { enumerable: false });
        });
      }

      if (includeNonEnumerable) {
        Object.getOwnPropertyNames(parent).forEach(propertyName => {
          const descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);
          if (!descriptor.enumerable) {
            child[propertyName] = _clone(parent[propertyName], depth - 1);
            Object.defineProperty(child, propertyName, { enumerable: false });
          }
        });
      }

      return child;
    }

    return _clone(parent, depth);
  }

  clone.clonePrototype = function clonePrototype(parent) {
    if (parent === null) return null;
    function C() {}
    C.prototype = parent;
    return new C();
  };

  clone.__objToStr = obj => Object.prototype.toString.call(obj);
  clone.__isDate = obj => clone.__objToStr(obj) === '[object Date]';
  clone.__isArray = obj => clone.__objToStr(obj) === '[object Array]';
  clone.__isRegExp = obj => clone.__objToStr(obj) === '[object RegExp]';
  const _getRegExpFlags = re => `${re.global ? 'g' : ''}${re.ignoreCase ? 'i' : ''}${re.multiline ? 'm' : ''}`;

  return clone;
})();

if (typeof module === 'object' && module.exports) {
  module.exports = clone;
}
