(function (global, factory) {
    // Check environment to export the module correctly
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.typeDetect = factory());
})(this, (function () {
    'use strict';

    // Check for the existence of ES6+ features
    const promiseExists = typeof Promise === 'function';
    const symbolExists = typeof Symbol !== 'undefined';
    const mapExists = typeof Map !== 'undefined';
    const setExists = typeof Set !== 'undefined';
    const weakMapExists = typeof WeakMap !== 'undefined';
    const weakSetExists = typeof WeakSet !== 'undefined';
    const dataViewExists = typeof DataView !== 'undefined';
    const symbolIteratorExists = symbolExists && typeof Symbol.iterator !== 'undefined';
    const symbolToStringTagExists = symbolExists && typeof Symbol.toStringTag !== 'undefined';

    // Get the global object in the current runtime context
    const globalObject = (() => {
        if (typeof globalThis === 'object') return globalThis;

        Object.defineProperty(Object.prototype, 'typeDetectGlobalObject', {
            get: function() { return this; },
            configurable: true,
        });
        const global = typeDetectGlobalObject;
        delete Object.prototype.typeDetectGlobalObject;
        return global;
    })();

    // Prototypes for iterator objects
    const setEntriesExists = setExists && typeof Set.prototype.entries === 'function';
    const mapEntriesExists = mapExists && typeof Map.prototype.entries === 'function';
    const setIteratorPrototype = setEntriesExists && Object.getPrototypeOf(new Set().entries());
    const mapIteratorPrototype = mapEntriesExists && Object.getPrototypeOf(new Map().entries());

    const arrayIteratorExists = symbolIteratorExists && typeof Array.prototype[Symbol.iterator] === 'function';
    const arrayIteratorPrototype = arrayIteratorExists && Object.getPrototypeOf([][Symbol.iterator]());

    const stringIteratorExists = symbolIteratorExists && typeof String.prototype[Symbol.iterator] === 'function';
    const stringIteratorPrototype = stringIteratorExists && Object.getPrototypeOf(''[Symbol.iterator]());

    const toStringLeftSliceLength = 8;
    const toStringRightSliceLength = -1;

    // Main function to detect type of an object
    function typeDetect(obj) {
        if (typeof obj !== 'object') return typeof obj;
        if (obj === null) return 'null';
        if (obj === globalObject) return 'global';

        if (Array.isArray(obj) && (!symbolToStringTagExists || !(Symbol.toStringTag in obj))) return 'Array';

        if (typeof window === 'object' && window !== null) {
            if (typeof window.location === 'object' && obj === window.location) return 'Location';
            if (typeof window.document === 'object' && obj === window.document) return 'Document';
            if (typeof window.navigator === 'object') {
                if (obj === window.navigator.mimeTypes) return 'MimeTypeArray';
                if (obj === window.navigator.plugins) return 'PluginArray';
            }
            if (obj instanceof window.HTMLElement) {
                const tagName = obj.tagName;
                if (tagName === 'BLOCKQUOTE') return 'HTMLQuoteElement';
                if (tagName === 'TD') return 'HTMLTableDataCellElement';
                if (tagName === 'TH') return 'HTMLTableHeaderCellElement';
            }
        }

        const stringTag = symbolToStringTagExists && obj[Symbol.toStringTag];
        if (typeof stringTag === 'string') return stringTag;

        const objPrototype = Object.getPrototypeOf(obj);
        if (objPrototype === RegExp.prototype) return 'RegExp';
        if (objPrototype === Date.prototype) return 'Date';
        if (promiseExists && objPrototype === Promise.prototype) return 'Promise';
        if (setExists && objPrototype === Set.prototype) return 'Set';
        if (mapExists && objPrototype === Map.prototype) return 'Map';
        if (weakSetExists && objPrototype === WeakSet.prototype) return 'WeakSet';
        if (weakMapExists && objPrototype === WeakMap.prototype) return 'WeakMap';
        if (dataViewExists && objPrototype === DataView.prototype) return 'DataView';

        if (mapExists && objPrototype === mapIteratorPrototype) return 'Map Iterator';
        if (setExists && objPrototype === setIteratorPrototype) return 'Set Iterator';
        if (arrayIteratorExists && objPrototype === arrayIteratorPrototype) return 'Array Iterator';
        if (stringIteratorExists && objPrototype === stringIteratorPrototype) return 'String Iterator';

        if (objPrototype === null) return 'Object';

        return Object.prototype.toString.call(obj).slice(toStringLeftSliceLength, toStringRightSliceLength);
    }

    return typeDetect;
}));
