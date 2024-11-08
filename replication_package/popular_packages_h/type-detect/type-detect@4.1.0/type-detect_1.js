(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.typeDetect = factory());
})(this, (function () { 'use strict';

    const promiseExists = typeof Promise === 'function';
    const globalObject = (function () {
        if (typeof globalThis === 'object') return globalThis;
        try {
            return (function() { return this; })() || Function('return this')();
        } catch (e) {
            if (typeof window === 'object') return window;
        }
    })();
    
    const symbolExists = typeof Symbol !== 'undefined';
    const mapExists = typeof Map !== 'undefined';
    const setExists = typeof Set !== 'undefined';
    const weakMapExists = typeof WeakMap !== 'undefined';
    const weakSetExists = typeof WeakSet !== 'undefined';
    const dataViewExists = typeof DataView !== 'undefined';
    const symbolIteratorExists = symbolExists && typeof Symbol.iterator !== 'undefined';
    const symbolToStringTagExists = symbolExists && typeof Symbol.toStringTag !== 'undefined';

    const setIteratorPrototype = setExists && Object.getPrototypeOf(new Set().entries());
    const mapIteratorPrototype = mapExists && Object.getPrototypeOf(new Map().entries());
    const arrayIteratorPrototype = symbolIteratorExists && Object.getPrototypeOf([][Symbol.iterator]());
    const stringIteratorPrototype = symbolIteratorExists && Object.getPrototypeOf(''[Symbol.iterator]());

    const toStringLeftSliceLength = 8;
    const toStringRightSliceLength = -1;

    function typeDetect(obj) {
        const typeofObj = typeof obj;
        if (typeofObj !== 'object' || obj === null) {
            return obj === null ? 'null' : typeofObj;
        }
        if (obj === globalObject) return 'global';
        if (Array.isArray(obj) && (!symbolToStringTagExists || !(Symbol.toStringTag in obj))) return 'Array';

        if (typeof window === 'object' && window !== null) {
            if (obj === window.location) return 'Location';
            if (obj === window.document) return 'Document';
            const nav = window.navigator;
            if (nav && nav.mimeTypes === obj) return 'MimeTypeArray';
            if (nav.plugins === obj) return 'PluginArray';
            if (obj instanceof window.HTMLElement) {
                const tagName = obj.tagName;
                if (tagName === 'BLOCKQUOTE') return 'HTMLQuoteElement';
                if (tagName === 'TD') return 'HTMLTableDataCellElement';
                if (tagName === 'TH') return 'HTMLTableHeaderCellElement';
            }
        }

        if (symbolToStringTagExists && typeof obj[Symbol.toStringTag] === 'string') {
            return obj[Symbol.toStringTag];
        }

        const objPrototype = Object.getPrototypeOf(obj);
        if (objPrototype === RegExp.prototype) return 'RegExp';
        if (objPrototype === Date.prototype) return 'Date';
        if (promiseExists && objPrototype === Promise.prototype) return 'Promise';
        if (setExists && objPrototype === Set.prototype) return 'Set';
        if (mapExists && objPrototype === Map.prototype) return 'Map';
        if (weakSetExists && objPrototype === WeakSet.prototype) return 'WeakSet';
        if (weakMapExists && objPrototype === WeakMap.prototype) return 'WeakMap';
        if (dataViewExists && objPrototype === DataView.prototype) return 'DataView';
        if (mapIteratorPrototype && objPrototype === mapIteratorPrototype) return 'Map Iterator';
        if (setIteratorPrototype && objPrototype === setIteratorPrototype) return 'Set Iterator';
        if (arrayIteratorPrototype && objPrototype === arrayIteratorPrototype) return 'Array Iterator';
        if (stringIteratorPrototype && objPrototype === stringIteratorPrototype) return 'String Iterator';

        return objPrototype === null ? 'Object' : Object.prototype.toString.call(obj).slice(toStringLeftSliceLength, toStringRightSliceLength);
    }

    return typeDetect;

}));
