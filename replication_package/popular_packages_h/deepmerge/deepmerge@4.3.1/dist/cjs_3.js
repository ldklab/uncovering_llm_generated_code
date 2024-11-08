'use strict';

const isMergeableObject = (value) => {
  return isNonNullObject(value) && !isSpecial(value);
};

const isNonNullObject = (value) => {
  return !!value && typeof value === 'object';
};

const isSpecial = (value) => {
  const stringValue = Object.prototype.toString.call(value);
  return stringValue === '[object RegExp]' 
      || stringValue === '[object Date]' 
      || isReactElement(value);
};

const canUseSymbol = typeof Symbol === 'function' && Symbol.for;
const REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

const isReactElement = (value) => {
  return value.$$typeof === REACT_ELEMENT_TYPE;
};

const emptyTarget = (val) => {
  return Array.isArray(val) ? [] : {};
};

const cloneUnlessOtherwiseSpecified = (value, options) => {
  return (options.clone !== false && options.isMergeableObject(value)) 
      ? deepmerge(emptyTarget(value), value, options) 
      : value;
};

const defaultArrayMerge = (target, source, options) => {
  return target.concat(source).map((element) => {
    return cloneUnlessOtherwiseSpecified(element, options);
  });
};

const getMergeFunction = (key, options) => {
  if (!options.customMerge) {
    return deepmerge;
  }
  const customMerge = options.customMerge(key);
  return typeof customMerge === 'function' ? customMerge : deepmerge;
};

const getEnumerableOwnPropertySymbols = (target) => {
  return Object.getOwnPropertySymbols
    ? Object.getOwnPropertySymbols(target).filter((symbol) => {
        return Object.propertyIsEnumerable.call(target, symbol);
      })
    : [];
};

const getKeys = (target) => {
  return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
};

const propertyIsOnObject = (object, property) => {
  try {
    return property in object;
  } catch (_) {
    return false;
  }
};

const propertyIsUnsafe = (target, key) => {
  return propertyIsOnObject(target, key) 
      && !(Object.hasOwnProperty.call(target, key) 
          && Object.propertyIsEnumerable.call(target, key));
};

const mergeObject = (target, source, options) => {
  const destination = {};
  if (options.isMergeableObject(target)) {
    getKeys(target).forEach((key) => {
      destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
    });
  }
  getKeys(source).forEach((key) => {
    if (propertyIsUnsafe(target, key)) {
      return;
    }
    if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
      destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
    } else {
      destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
    }
  });
  return destination;
};

const deepmerge = (target, source, options = {}) => {
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
};

deepmerge.all = (array, options) => {
  if (!Array.isArray(array)) {
    throw new Error('first argument should be an array');
  }
  
  return array.reduce((prev, next) => deepmerge(prev, next, options), {});
};

module.exports = deepmerge;
