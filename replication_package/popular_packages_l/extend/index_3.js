// File: extend.js

const isObject = (obj) => obj !== null && typeof obj === 'object';

const extend = function() {
    let options, name, src, copy, copyIsArray, clone;
    let target = arguments[0] || {};
    let i = 1;
    let length = arguments.length;
    let deep = false;

    if (typeof target === 'boolean') {
        deep = target;
        target = arguments[1] || {};
        i = 2;
    }

    if (typeof target !== 'object' && typeof target !== 'function') {
        target = {};
    }

    for (; i < length; i++) {
        if ((options = arguments[i]) != null) {
            for (name in options) {
                src = target[name];
                copy = options[name];

                if (target === copy) {
                    continue;
                }

                if (deep && copy && (isObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && Array.isArray(src) ? src : [];
                    } else {
                        clone = src && isObject(src) ? src : {};
                    }

                    target[name] = extend(deep, clone, copy);

                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    return target;
}

module.exports = extend;
