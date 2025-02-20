const clone = (() => {
  'use strict';

  // Helper function to check if an object is an instance of a type
  function _instanceof(obj, type) {
    return type != null && obj instanceof type;
  }

  // Check for existence of native data structures
  let nativeMap = Map || function() {};
  let nativeSet = Set || function() {};
  let nativePromise = Promise || function() {};
  
  // Deep clone function with support for various data types and circular references
  function clone(parent, circular = true, depth = Infinity, prototype, includeNonEnumerable = false) {
    if (typeof circular === 'object') {
      ({depth, prototype, includeNonEnumerable, circular} = circular);
    }
    
    const allParents = [];
    const allChildren = [];
    const useBuffer = typeof Buffer !== 'undefined';

    // Internal recursive clone function
    function _clone(parent, depth) {
      if (parent === null) return null;
      if (typeof parent !== 'object' || depth === 0) return parent;
      
      // Initialize child based on the parent type
      let child;
      let proto;
      if (_instanceof(parent, nativeMap)) child = new nativeMap();
      else if (_instanceof(parent, nativeSet)) child = new nativeSet();
      else if (_instanceof(parent, nativePromise)) {
        child = new nativePromise((resolve, reject) => {
          parent.then(
            value => resolve(_clone(value, depth - 1)),
            err => reject(_clone(err, depth - 1))
          );
        });
      } else if (clone.__isArray(parent)) child = [];
      else if (clone.__isRegExp(parent)) {
        child = new RegExp(parent.source, __getRegExpFlags(parent));
        child.lastIndex = parent.lastIndex;
      } else if (clone.__isDate(parent)) child = new Date(parent.getTime());
      else if (useBuffer && Buffer.isBuffer(parent)) {
        child = Buffer.allocUnsafe(parent.length);
        parent.copy(child);
        return child;
      } else if (_instanceof(parent, Error)) {
        child = Object.create(parent);
      } else {
        proto = prototype || Object.getPrototypeOf(parent);
        child = Object.create(proto);
      }

      // Handle circular references
      if (circular) {
        const index = allParents.indexOf(parent);
        if (index !== -1) return allChildren[index];
        allParents.push(parent);
        allChildren.push(child);
      }

      // Clone Maps and Sets
      if (_instanceof(parent, nativeMap)) {
        parent.forEach((value, key) => {
          child.set(_clone(key, depth - 1), _clone(value, depth - 1));
        });
      } else if (_instanceof(parent, nativeSet)) {
        parent.forEach(value => {
          child.add(_clone(value, depth - 1));
        });
      }

      // Clone object properties
      for (const key in parent) {
        let attrs = proto ? Object.getOwnPropertyDescriptor(proto, key) : null;
        if (!attrs || attrs.set != null) {
          child[key] = _clone(parent[key], depth - 1);
        }
      }

      // Clone symbols
      if (Object.getOwnPropertySymbols) {
        Object.getOwnPropertySymbols(parent).forEach(symbol => {
          const desc = Object.getOwnPropertyDescriptor(parent, symbol);
          if (desc && (desc.enumerable || includeNonEnumerable)) {
            child[symbol] = _clone(parent[symbol], depth - 1);
            if (!desc.enumerable) {
              Object.defineProperty(child, symbol, { enumerable: false });
            }
          }
        });
      }

      // Clone non-enumerable properties if specified
      if (includeNonEnumerable) {
        Object.getOwnPropertyNames(parent).forEach(name => {
          const desc = Object.getOwnPropertyDescriptor(parent, name);
          if (!desc.enumerable) {
            child[name] = _clone(parent[name], depth - 1);
            Object.defineProperty(child, name, { enumerable: false });
          }
        });
      }

      return child;
    }

    return _clone(parent, depth);
  }

  // Flat clone function for prototypes
  clone.clonePrototype = function clonePrototype(parent) {
    if (parent === null) return null;
    const c = function() {};
    c.prototype = parent;
    return new c();
  };

  // Utility functions to check data type
  function __objToStr(o) {
    return Object.prototype.toString.call(o);
  }
  function __isDate(o) {
    return __objToStr(o) === '[object Date]';
  }
  function __isArray(o) {
    return __objToStr(o) === '[object Array]';
  }
  function __isRegExp(o) {
    return __objToStr(o) === '[object RegExp]';
  }
  function __getRegExpFlags(re) {
    return (re.global ? 'g' : '') + (re.ignoreCase ? 'i' : '') + (re.multiline ? 'm' : '');
  }

  // Expose utility functions
  clone.__objToStr = __objToStr;
  clone.__isDate = __isDate;
  clone.__isArray = __isArray;
  clone.__isRegExp = __isRegExp;
  clone.__getRegExpFlags = __getRegExpFlags;

  return clone;
})();

// Export module if running in Node.js
if (typeof module === 'object' && module.exports) {
  module.exports = clone;
}
