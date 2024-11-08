'use strict';

const keys = require('object-keys');
const hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

const toStr = Object.prototype.toString;
const concat = Array.prototype.concat;
const origDefineProperty = Object.defineProperty;

const isFunction = function (fn) {
    return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
};

const arePropertyDescriptorsSupported = function () {
    const obj = {};
    try {
        origDefineProperty(obj, 'x', { enumerable: false, value: obj });
        for (const _ in obj) {
            return false;
        }
        return obj.x === obj;
    } catch (e) {
        return false;
    }
};
const supportsDescriptors = origDefineProperty && arePropertyDescriptorsSupported();

const defineProperty = function (object, name, value, predicate) {
    if (name in object && (!isFunction(predicate) || !predicate())) {
        return;
    }
    if (supportsDescriptors) {
        origDefineProperty(object, name, {
            configurable: true,
            enumerable: false,
            value: value,
            writable: true
        });
    } else {
        object[name] = value;
    }
};

const defineProperties = function (object, map, predicates = {}) {
    let props = keys(map);
    if (hasSymbols) {
        props = concat.call(props, Object.getOwnPropertySymbols(map));
    }
    for (let i = 0; i < props.length; i += 1) {
        defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
    }
};

defineProperties.supportsDescriptors = Boolean(supportsDescriptors);

module.exports = defineProperties;
