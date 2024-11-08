const _ = require('lodash');

function executeFuncs(config) {
  return typeof config === 'function' ? config() : config;
}

function mergeWithCustomize(customizers = {}) {
  return function merge(...configs) {
    const resolvedConfigs = configs.map(executeFuncs).flat();
    
    return resolvedConfigs.reduce((acc, currConfig) => {
      return deepMerge(acc, currConfig, customizers);
    }, {});
  };
}

function deepMerge(target, source, customizers) {
  if (Array.isArray(target) && Array.isArray(source)) {
    return handleArray(target, source, customizers);
  } else if (_.isObject(target) && _.isObject(source)) {
    return handleObject(target, source, customizers);
  }
  return source;
}

function handleArray(targetArray, sourceArray, customizers) {
  if (customizers && customizers.customizeArray) {
    const custom = customizers.customizeArray(targetArray, sourceArray);
    if (custom !== undefined) return custom;
  }
  return [...targetArray, ...sourceArray];
}

function handleObject(targetObject, sourceObject, customizers) {
  if (customizers && customizers.customizeObject) {
    const custom = customizers.customizeObject(targetObject, sourceObject);
    if (custom !== undefined) return custom;
  }
  return _.mergeWith({}, targetObject, sourceObject, (objVal, srcVal) =>
    deepMerge(objVal, srcVal, customizers)
  );
}

function unique(field, fields, matcher) {
  return function uniqueCustomizer(targetArray, sourceArray) {
    const existing = new Set(
      targetArray.map(item => fields.map(f => matcher(item[f])))
    );
    return [
      ...targetArray,
      ...sourceArray.filter(item => !existing.has(fields.map(f => matcher(item[f]))))
    ];
  };
}

function mergeWithRules(rules) {
  return function (...configurations) {
    return configurations.reduce((acc, config) =>
      _.mergeWith(acc, config, (objValue, srcValue, key, obj, src, stack) => {
        if (rules[key] && typeof rules[key] === 'object' && stack.size) {
          if (rules[key].match === 'match') {
            return deepMerge(objValue, srcValue, {});
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
  merge: mergeWithCustomize({}),
  mergeWithCustomize,
  mergeWithRules,
  unique,
};
