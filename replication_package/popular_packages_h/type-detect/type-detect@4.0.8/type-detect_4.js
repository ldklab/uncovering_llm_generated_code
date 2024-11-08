(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        global.typeDetect = factory();
    }
}(this, (function () {
    'use strict';

    const promiseExists = typeof Promise === 'function';
    const symbolExists = typeof Symbol !== 'undefined';
    const mapExists = typeof Map !== 'undefined';
    const setExists = typeof Set !== 'undefined';
    const weakMapExists = typeof WeakMap !== 'undefined';
    const weakSetExists = typeof WeakSet !== 'undefined';
    const dataViewExists = typeof DataView !== 'undefined';
    const symbolIteratorExists = symbolExists && typeof Symbol.iterator !== 'undefined';
    const symbolToStringTagExists = symbolExists && typeof Symbol.toStringTag !== 'undefined';
    const setEntriesExists = setExists && typeof Set.prototype.entries === 'function';
    const mapEntriesExists = mapExists && typeof Map.prototype.entries === 'function';
    const globalObject = typeof self === 'object' ? self : global;
    
    function checkObjectType(obj) {
        if (obj === global) {
            return 'global';
        }
        if (Array.isArray(obj) &&
            (!symbolToStringTagExists || !(Symbol.toStringTag in obj))) {
            return 'Array';
        }
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
            if ((typeof window.HTMLElement === 'function' || typeof window.HTMLElement === 'object') &&
                obj instanceof window.HTMLElement) {
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
        
        let objPrototype = Object.getPrototypeOf(obj);
        if (objPrototype === RegExp.prototype) {
            return 'RegExp';
        }
        if (objPrototype === Date.prototype) {
            return 'Date';
        }
        if (promiseExists && objPrototype === Promise.prototype) {
            return 'Promise';
        }
        if (setExists && objPrototype === Set.prototype) {
            return 'Set';
        }
        if (mapExists && objPrototype === Map.prototype) {
            return 'Map';
        }
        if (weakSetExists && objPrototype === WeakSet.prototype) {
            return 'WeakSet';
        }
        if (weakMapExists && objPrototype === WeakMap.prototype) {
            return 'WeakMap';
        }
        if (dataViewExists && objPrototype === DataView.prototype) {
            return 'DataView';
        }

        const mapIteratorPrototype = mapEntriesExists && Object.getPrototypeOf(new Map().entries());
        const setIteratorPrototype = setEntriesExists && Object.getPrototypeOf(new Set().entries());
        if (mapExists && objPrototype === mapIteratorPrototype) {
            return 'Map Iterator';
        }
        if (setExists && objPrototype === setIteratorPrototype) {
            return 'Set Iterator';
        }

        const arrayIteratorExists = symbolIteratorExists && typeof Array.prototype[Symbol.iterator] === 'function';
        const arrayIteratorPrototype = arrayIteratorExists && Object.getPrototypeOf([][Symbol.iterator]());
        if (arrayIteratorExists && objPrototype === arrayIteratorPrototype) {
            return 'Array Iterator';
        }

        const stringIteratorExists = symbolIteratorExists && typeof String.prototype[Symbol.iterator] === 'function';
        const stringIteratorPrototype = stringIteratorExists && Object.getPrototypeOf(''[Symbol.iterator]());
        if (stringIteratorExists && objPrototype === stringIteratorPrototype) {
            return 'String Iterator';
        }

        if (objPrototype === null) {
            return 'Object';
        }
        
        return Object.prototype.toString.call(obj).slice(8, -1);
    }

    function typeDetect(obj) {
        const typeofObj = typeof obj;
        if (typeofObj !== 'object') {
            return typeofObj;
        }
        if (obj === null) {
            return 'null';
        }
        
        return checkObjectType(obj);
    }

    return typeDetect;
})));
