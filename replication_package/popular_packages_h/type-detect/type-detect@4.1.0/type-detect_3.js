(function (global, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        var glob = typeof globalThis !== 'undefined' ? globalThis : global || self;
        glob.typeDetect = factory();
    }
})(this, function () {
    'use strict';

    const isFunction = fn => typeof fn === 'function';
    const globalObject = typeof globalThis !== 'undefined' ? globalThis : (function () { return this; })();

    const exists = obj => typeof obj !== 'undefined';

    const promiseExists = exists(Promise);
    const symbolExists = exists(Symbol);
    const mapExists = exists(Map);
    const setExists = exists(Set);
    const weakMapExists = exists(WeakMap);
    const weakSetExists = exists(WeakSet);
    const dataViewExists = exists(DataView);
    const symbolIteratorExists = symbolExists && exists(Symbol.iterator);
    const symbolToStringTagExists = symbolExists && exists(Symbol.toStringTag);
    
    const setEntriesExists = setExists && isFunction(Set.prototype.entries);
    const mapEntriesExists = mapExists && isFunction(Map.prototype.entries);

    const getIteratorPrototype = (obj, protoMethod) => obj && isFunction(obj[protoMethod]) && Object.getPrototypeOf(new obj()[protoMethod]());

    const setIteratorPrototype = getIteratorPrototype(Set, 'entries');
    const mapIteratorPrototype = getIteratorPrototype(Map, 'entries');
    const arrayIteratorPrototype = symbolIteratorExists && getIteratorPrototype(Array, Symbol.iterator);
    const stringIteratorPrototype = symbolIteratorExists && getIteratorPrototype(String, Symbol.iterator);

    function typeDetect(obj) {
        const typeofObj = typeof obj;
        if (typeofObj !== 'object') {
            return typeofObj;
        }

        if (obj === null) {
            return 'null';
        }

        if (obj === globalObject) {
            return 'global';
        }

        if (Array.isArray(obj) && (!symbolToStringTagExists || !(Symbol.toStringTag in obj))) {
            return 'Array';
        }

        if (typeof window === 'object' && window !== null) {
            if (obj === window.location) return 'Location';
            if (obj === window.document) return 'Document';

            if (obj === window.navigator.mimeTypes) return 'MimeTypeArray';
            if (obj === window.navigator.plugins) return 'PluginArray';

            if (obj instanceof window.HTMLElement) {
                switch (obj.tagName) {
                    case 'BLOCKQUOTE': return 'HTMLQuoteElement';
                    case 'TD': return 'HTMLTableDataCellElement';
                    case 'TH': return 'HTMLTableHeaderCellElement';
                }
            }
        }

        const stringTag = obj[Symbol.toStringTag];
        if (typeof stringTag === 'string') {
            return stringTag;
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

        if (mapExists && objPrototype === mapIteratorPrototype) return 'Map Iterator';
        if (setExists && objPrototype === setIteratorPrototype) return 'Set Iterator';
        if (arrayIteratorPrototype && objPrototype === arrayIteratorPrototype) return 'Array Iterator';
        if (stringIteratorPrototype && objPrototype === stringIteratorPrototype) return 'String Iterator';

        if (objPrototype === null) return 'Object';

        return Object.prototype.toString.call(obj).slice(8, -1);
    }

    return typeDetect;
});
