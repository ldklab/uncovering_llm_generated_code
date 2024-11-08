const _ = require('lodash');

function executeFuncs(conf) {
  return typeof conf === 'function' ? conf() : conf;
}

function mergeWithCustomize(customizers = {}) {
  return function merge(...configurations) {
    const resolvedConfig = configurations.map(executeFuncs).flat();
    
    return resolvedConfig.reduce((accumulator, currentConfig) => {
      return deepMerge(accumulator, currentConfig, customizers);
    }, {});
  };
}

function deepMerge(target, source, customizers) {
  if (Array.isArray(target) && Array.isArray(source)) {
    return customizeArray(target, source, customizers);
  } else if (_.isObject(target) && _.isObject(source)) {
    return customizeObject(target, source, customizers);
  }
  return source;
}

function customizeArray(targetArray, sourceArray, customizers) {
  if (customizers && customizers.customizeArray) {
    const custom = customizers.customizeArray(targetArray, sourceArray);
    if (custom !== undefined) return custom;
  }
  return [...targetArray, ...sourceArray];
}

function customizeObject(targetObject, sourceObject, customizers) {
  if (customizers && customizers.customizeObject) {
    const custom = customizers.customizeObject(targetObject, sourceObject);
    if (custom !== undefined) return custom;
  }
  return _.mergeWith({}, targetObject, sourceObject, (objValue, srcValue) =>
    deepMerge(objValue, srcValue, customizers)
  );
}

function unique(field, fields, matcher) {
  return function uniqueCustomizer(targetArray, sourceArray) {
    const set = new Set(
      targetArray.map(item => fields.map(f => matcher(item[f])))
    );
    return [
      ...targetArray,
      ...sourceArray.filter(item => !set.has(fields.map(f => matcher(item[f]))))
    ];
  };
}

function mergeWithRules(rules) {
  return function (...configs) {
    return configs.reduce((acc, conf) =>
      _.mergeWith(acc, conf, (objValue, srcValue, key, obj, src, stack) => {
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
