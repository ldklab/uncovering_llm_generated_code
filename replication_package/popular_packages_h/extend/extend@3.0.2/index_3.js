'use strict';

const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;
const defineProperty = Object.defineProperty;
const gOPD = Object.getOwnPropertyDescriptor;

const isArray = (arr) => {
    return Array.isArray ? Array.isArray(arr) : toStr.call(arr) === '[object Array]';
};

const isPlainObject = (obj) => {
    if (!obj || toStr.call(obj) !== '[object Object]') {
        return false;
    }

    const hasOwnConstructor = hasOwn.call(obj, 'constructor');
    const hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
    
    if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
        return false;
    }

    let key;
    for (key in obj) { /* iterate through all properties */ }

    return typeof key === 'undefined' || hasOwn.call(obj, key);
};

const setProperty = (target, { name, newValue }) => {
    if (defineProperty && name === '__proto__') {
        defineProperty(target, name, {
            enumerable: true,
            configurable: true,
            value: newValue,
            writable: true
        });
    } else {
        target[name] = newValue;
    }
};

const getProperty = (obj, name) => {
    if (name === '__proto__') {
        if (!hasOwn.call(obj, name)) {
            return undefined;
        } else if (gOPD) {
            return gOPD(obj, name).value;
        }
    }

    return obj[name];
};

const extend = function() {
    let options, name, src, copy, copyIsArray, clone;
    let target = arguments[0];
    let i = 1;
    const length = arguments.length;
    let deep = false;

    if (typeof target === 'boolean') {
        deep = target;
        target = arguments[1] || {};
        i = 2;
    }
    if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
        target = {};
    }

    for (; i < length; i++) {
        options = arguments[i];
        if (options != null) {
            for (name in options) {
                src = getProperty(target, name);
                copy = getProperty(options, name);

                if (target !== copy) {
                    if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && isArray(src) ? src : [];
                        } else {
                            clone = src && isPlainObject(src) ? src : {};
                        }

                        setProperty(target, { name, newValue: extend(deep, clone, copy) });
                    } else if (typeof copy !== 'undefined') {
                        setProperty(target, { name, newValue: copy });
                    }
                }
            }
        }
    }

    return target;
};

module.exports = extend;
