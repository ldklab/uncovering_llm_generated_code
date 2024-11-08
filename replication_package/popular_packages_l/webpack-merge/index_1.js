const _ = require('lodash');

function executeFunctionIfNeeded(config) {
  return typeof config === 'function' ? config() : config;
}

function createCustomMerge(customizers = {}) {
  return function customMerge(...configs) {
    const resolvedConfigs = configs.map(executeFunctionIfNeeded).flat();
    
    return resolvedConfigs.reduce((mergedConfig, currentConfig) => {
      return applyDeepMerge(mergedConfig, currentConfig, customizers);
    }, {});
  };
}

function applyDeepMerge(target, source, customizers) {
  if (Array.isArray(target) && Array.isArray(source)) {
    return mergeArrays(target, source, customizers);
  } else if (_.isObject(target) && _.isObject(source)) {
    return mergeObjects(target, source, customizers);
  }
  return source;
}

function mergeArrays(targetArray, sourceArray, customizers) {
  if (customizers && customizers.customizeArray) {
    const customizedResult = customizers.customizeArray(targetArray, sourceArray);
    if (customizedResult !== undefined) return customizedResult;
  }
  return [...targetArray, ...sourceArray];
}

function mergeObjects(targetObject, sourceObject, customizers) {
  if (customizers && customizers.customizeObject) {
    const customizedResult = customizers.customizeObject(targetObject, sourceObject);
    if (customizedResult !== undefined) return customizedResult;
  }
  return _.mergeWith({}, targetObject, sourceObject, (objValue, srcValue) =>
    applyDeepMerge(objValue, srcValue, customizers)
  );
}

function ensureUniqueEntries(identifier, fields, comparer) {
  return function uniqueArrayMerge(targetArray, sourceArray) {
    const existingItemsSet = new Set(
      targetArray.map(item => fields.map(f => comparer(item[f])))
    );
    return [
      ...targetArray,
      ...sourceArray.filter(item => !existingItemsSet.has(fields.map(f => comparer(item[f]))))
    ];
  };
}

function mergeWithSpecificRules(rules) {
  return function (...configs) {
    return configs.reduce((accumulatedConfig, currentConfig) =>
      _.mergeWith(accumulatedConfig, currentConfig, (objValue, srcValue, key, obj, src, stack) => {
        if (rules[key] && typeof rules[key] === 'object' && stack.size) {
          if (rules[key].match === 'match') {
            return applyDeepMerge(objValue, srcValue, {});
          }
          if (rules[key].options === 'replace') {
            return srcValue;
          }
        }
        return undefined;
      }),
    {},
    );
  };
}

module.exports = {
  merge: createCustomMerge({}),
  mergeWithCustomize: createCustomMerge,
  mergeWithRules: mergeWithSpecificRules,
  unique: ensureUniqueEntries,
};
