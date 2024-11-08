'use strict';

function isNonNullObject(value) {
    return value && typeof value === 'object';
}

function isSpecial(value) {
    const stringValue = Object.prototype.toString.call(value);
    return ['[object RegExp]', '[object Date]'].includes(stringValue) || isReactElement(value);
}

const canUseSymbol = typeof Symbol === 'function' && Symbol.for;
const REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
    return value.$$typeof === REACT_ELEMENT_TYPE;
}

const isMergeableObject = value => isNonNullObject(value) && !isSpecial(value);

function emptyTarget(val) {
    return Array.isArray(val) ? [] : {};
}

function cloneUnlessOtherwiseSpecified(value, options) {
    return (options.clone !== false && options.isMergeableObject(value))
        ? deepmerge(emptyTarget(value), value, options)
        : value;
}

function defaultArrayMerge(target, source, options) {
    return target.concat(source).map(element => cloneUnlessOtherwiseSpecified(element, options));
}

function getMergeFunction(key, options) {
    const customMerge = options.customMerge && options.customMerge(key);
    return typeof customMerge === 'function' ? customMerge : deepmerge;
}

function getEnumerableOwnPropertySymbols(target) {
    return Object.getOwnPropertySymbols
        ? Object.getOwnPropertySymbols(target).filter(symbol => Object.propertyIsEnumerable.call(target, symbol))
        : [];
}

function getKeys(target) {
    return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
}

function propertyIsOnObject(object, property) {
    try {
        return property in object;
    } catch (_) {
        return false;
    }
}

function propertyIsUnsafe(target, key) {
    return propertyIsOnObject(target, key) && !(
        Object.hasOwnProperty.call(target, key) && Object.propertyIsEnumerable.call(target, key)
    );
}

function mergeObject(target, source, options) {
    const destination = {};
    if (options.isMergeableObject(target)) {
        getKeys(target).forEach(key => {
            destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
        });
    }
    getKeys(source).forEach(key => {
        if (propertyIsUnsafe(target, key)) return;

        if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
            destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
        } else {
            destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
        }
    });
    return destination;
}

function deepmerge(target, source, options = {}) {
    options.arrayMerge = options.arrayMerge || defaultArrayMerge;
    options.isMergeableObject = options.isMergeableObject || isMergeableObject;
    options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

    const sourceIsArray = Array.isArray(source);
    const targetIsArray = Array.isArray(target);
    const typesMatch = sourceIsArray === targetIsArray;

    if (!typesMatch) {
        return cloneUnlessOtherwiseSpecified(source, options);
    } else if (sourceIsArray) {
        return options.arrayMerge(target, source, options);
    } else {
        return mergeObject(target, source, options);
    }
}

deepmerge.all = function deepmergeAll(array, options) {
    if (!Array.isArray(array)) {
        throw new Error('first argument should be an array');
    }
    return array.reduce((prev, next) => deepmerge(prev, next, options), {});
};

module.exports = deepmerge;
