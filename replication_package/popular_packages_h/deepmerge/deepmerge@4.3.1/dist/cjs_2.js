'use strict';

function isNonNullObject(value) {
    return !!value && typeof value === 'object';
}

function isReactElement(value) {
    const REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol.for ? Symbol.for('react.element') : 0xeac7;
    return value.$$typeof === REACT_ELEMENT_TYPE;
}

function isSpecial(value) {
    const stringValue = Object.prototype.toString.call(value);
    return stringValue === '[object RegExp]' || stringValue === '[object Date]' || isReactElement(value);
}

function isMergeableObject(value) {
    return isNonNullObject(value) && !isSpecial(value);
}

function cloneUnlessOtherwiseSpecified(value, options) {
    return options.clone !== false && isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
}

function emptyTarget(val) {
    return Array.isArray(val) ? [] : {};
}

function defaultArrayMerge(target, source, options) {
    return target.concat(source).map(element => cloneUnlessOtherwiseSpecified(element, options));
}

function getMergeFunction(key, options) {
    return options.customMerge ? options.customMerge(key) || deepmerge : deepmerge;
}

function getKeys(target) {
    if (!target) return [];
    const ownKeys = Object.keys(target);
    return typeof Object.getOwnPropertySymbols === 'function' ? ownKeys.concat(Object.getOwnPropertySymbols(target).filter(symbol => Object.propertyIsEnumerable.call(target, symbol))) : ownKeys;
}

function propertyIsOnObject(object, property) {
    try {
        return property in object;
    } catch {
        return false;
    }
}

function propertyIsUnsafe(target, key) {
    return propertyIsOnObject(target, key) && !(Object.hasOwnProperty.call(target, key) && Object.propertyIsEnumerable.call(target, key));
}

function mergeObject(target, source, options) {
    const destination = {};
    if (isMergeableObject(target)) {
        getKeys(target).forEach(key => {
            destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
        });
    }
    getKeys(source).forEach(key => {
        if (propertyIsUnsafe(target, key)) return;
        if (propertyIsOnObject(target, key) && isMergeableObject(source[key])) {
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
    const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

    if (!sourceAndTargetTypesMatch) {
        return cloneUnlessOtherwiseSpecified(source, options);
    } else if (sourceIsArray) {
        return options.arrayMerge(target, source, options);
    } else {
        return mergeObject(target, source, options);
    }
}

deepmerge.all = function(array, options) {
    if (!Array.isArray(array)) {
        throw new Error('first argument should be an array');
    }
    return array.reduce((prev, next) => deepmerge(prev, next, options), {});
};

module.exports = deepmerge;
