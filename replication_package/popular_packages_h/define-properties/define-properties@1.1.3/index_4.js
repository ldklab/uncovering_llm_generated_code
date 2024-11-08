'use strict';

const keys = require('object-keys');
const hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

const toStr = Object.prototype.toString;
const { concat } = Array.prototype;
const origDefineProperty = Object.defineProperty;

const isFunction = (fn) => typeof fn === 'function' && toStr.call(fn) === '[object Function]';

const arePropertyDescriptorsSupported = () => {
    const testObj = {};
    try {
        origDefineProperty(testObj, 'x', { enumerable: false, value: testObj });
        for (const _ in testObj) {
            return false;
        }
        return testObj.x === testObj;
    } catch {
        return false;
    }
};

const supportsDescriptors = !!origDefineProperty && arePropertyDescriptorsSupported();

const defineProperty = (object, name, value, predicate) => {
    if (!(name in object) || (isFunction(predicate) && predicate())) {
        if (supportsDescriptors) {
            origDefineProperty(object, name, {
                configurable: true,
                enumerable: false,
                value,
                writable: true
            });
        } else {
            object[name] = value;
        }
    }
};

const defineProperties = (object, propertiesMap, predicates = {}) => {
    let propertyNames = keys(propertiesMap);
    if (hasSymbols) {
        propertyNames = concat.call(propertyNames, Object.getOwnPropertySymbols(propertiesMap));
    }
    propertyNames.forEach((propertyName) => {
        defineProperty(object, propertyName, propertiesMap[propertyName], predicates[propertyName]);
    });
};

defineProperties.supportsDescriptors = supportsDescriptors;

module.exports = defineProperties;
