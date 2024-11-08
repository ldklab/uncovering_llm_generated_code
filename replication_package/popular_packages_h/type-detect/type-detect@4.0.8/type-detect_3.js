(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.typeDetect = factory();
  }
}(this, function () {
  'use strict';

  var promiseAvailable = typeof Promise === 'function';
  var globalObj = typeof self === 'object' ? self : global;

  var supportsSymbol = typeof Symbol !== 'undefined';
  var supportsMap = typeof Map !== 'undefined';
  var supportsSet = typeof Set !== 'undefined';
  var supportsWeakMap = typeof WeakMap !== 'undefined';
  var supportsWeakSet = typeof WeakSet !== 'undefined';
  var supportsDataView = typeof DataView !== 'undefined';
  
  var supportsSymbolIterator = supportsSymbol && typeof Symbol.iterator !== 'undefined';
  var supportsSymbolToStringTag = supportsSymbol && typeof Symbol.toStringTag !== 'undefined';

  var mapEntriesPrototype = supportsMap && typeof Map.prototype.entries === 'function' ? Object.getPrototypeOf(new Map().entries()) : undefined;
  var setEntriesPrototype = supportsSet && typeof Set.prototype.entries === 'function' ? Object.getPrototypeOf(new Set().entries()) : undefined;

  var arrayIteratorPrototype = supportsSymbolIterator && typeof Array.prototype[Symbol.iterator] === 'function' ? Object.getPrototypeOf([][Symbol.iterator]()) : undefined;
  var stringIteratorPrototype = supportsSymbolIterator && typeof String.prototype[Symbol.iterator] === 'function' ? Object.getPrototypeOf(''[Symbol.iterator]()) : undefined;

  function typeDetect(obj) {
    var objType = typeof obj;
    if (objType !== 'object') {
      return objType;
    }

    if (obj === null) {
      return 'null';
    }

    if (obj === globalObj) {
      return 'global';
    }

    if (Array.isArray(obj) && (!supportsSymbolToStringTag || !(Symbol.toStringTag in obj))) {
      return 'Array';
    }

    // Checks for HTML and plugin objects
    if (typeof window === 'object' && window !== null) {
      if (typeof window.location === 'object' && obj === window.location) {
        return 'Location';
      }
      if (typeof window.document === 'object' && obj === window.document) {
        return 'Document';
      }
      if (typeof window.navigator === 'object') {
        if (typeof window.navigator.mimeTypes === 'object' && obj === window.navigator.mimeTypes) {
          return 'MimeTypeArray';
        }
        if (typeof window.navigator.plugins === 'object' && obj === window.navigator.plugins) {
          return 'PluginArray';
        }
      }
      if ((typeof window.HTMLElement === 'function' || typeof window.HTMLElement === 'object') && obj instanceof window.HTMLElement) {
        if (obj.tagName === 'BLOCKQUOTE') {
          return 'HTMLQuoteElement';
        }
        if (obj.tagName === 'TD') {
          return 'HTMLTableDataCellElement';
        }
        if (obj.tagName === 'TH') {
          return 'HTMLTableHeaderCellElement';
        }
      }
    }

    var stringTag = supportsSymbolToStringTag && obj[Symbol.toStringTag];
    if (typeof stringTag === 'string') {
      return stringTag;
    }

    var objPrototype = Object.getPrototypeOf(obj);
    if (objPrototype === RegExp.prototype) {
      return 'RegExp';
    }
    if (objPrototype === Date.prototype) {
      return 'Date';
    }
    if (promiseAvailable && objPrototype === Promise.prototype) {
      return 'Promise';
    }
    if (supportsSet && objPrototype === Set.prototype) {
      return 'Set';
    }
    if (supportsMap && objPrototype === Map.prototype) {
      return 'Map';
    }
    if (supportsWeakSet && objPrototype === WeakSet.prototype) {
      return 'WeakSet';
    }
    if (supportsWeakMap && objPrototype === WeakMap.prototype) {
      return 'WeakMap';
    }
    if (supportsDataView && objPrototype === DataView.prototype) {
      return 'DataView';
    }
    if (mapEntriesPrototype && objPrototype === mapEntriesPrototype) {
      return 'Map Iterator';
    }
    if (setEntriesPrototype && objPrototype === setEntriesPrototype) {
      return 'Set Iterator';
    }
    if (arrayIteratorPrototype && objPrototype === arrayIteratorPrototype) {
      return 'Array Iterator';
    }
    if (stringIteratorPrototype && objPrototype === stringIteratorPrototype) {
      return 'String Iterator';
    }
    if (objPrototype === null) {
      return 'Object';
    }

    return Object.prototype.toString.call(obj).slice(8, -1);
  }

  return typeDetect;
}));
