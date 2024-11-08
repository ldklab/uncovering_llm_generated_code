const _ = require('lodash');

function executeFunctions(configuration) {
  return typeof configuration === 'function' ? configuration() : configuration;
}

function createMergeFunction(customizers = {}) {
  return function mergeConfigs(...configs) {
    const processedConfigs = configs.map(executeFunctions).flat();
    
    return processedConfigs.reduce((result, config) => {
      return recursivelyMerge(result, config, customizers);
    }, {});
  };
}

function recursivelyMerge(target, source, customizers) {
  if (Array.isArray(target) && Array.isArray(source)) {
    return mergeArrays(target, source, customizers);
  } else if (_.isObject(target) && _.isObject(source)) {
    return mergeObjects(target, source, customizers);
  }
  return source;
}

function mergeArrays(targetArray, sourceArray, customizers) {
  if (customizers?.customizeArray) {
    const customResult = customizers.customizeArray(targetArray, sourceArray);
    if (customResult !== undefined) return customResult;
  }
  return [...targetArray, ...sourceArray];
}

function mergeObjects(targetObject, sourceObject, customizers) {
  if (customizers?.customizeObject) {
    const customResult = customizers.customizeObject(targetObject, sourceObject);
    if (customResult !== undefined) return customResult;
  }
  return _.mergeWith({}, targetObject, sourceObject, (targetVal, sourceVal) =>
    recursivelyMerge(targetVal, sourceVal, customizers)
  );
}

function createUniqueFieldHandler(field, fields, matcher) {
  return function uniqueMerge(targetArray, sourceArray) {
    const uniqueSet = new Set(
      targetArray.map(item => fields.map(f => matcher(item[f])))
    );
    return [
      ...targetArray,
      ...sourceArray.filter(item =>
        !uniqueSet.has(fields.map(f => matcher(item[f])))
      )
    ];
  };
}

function createMergeWithRulesFunction(rules) {
  return function (...configs) {
    return configs.reduce((acc, config) =>
      _.mergeWith(acc, config, (targetVal, sourceVal, key, target, source, stack) => {
        if (rules[key] && typeof rules[key] === 'object' && stack.size) {
          if (rules[key].match === 'match') {
            return recursivelyMerge(targetVal, sourceVal, {});
          }
          if (rules[key].options === 'replace') {
            return sourceVal;
          }
        }
        return undefined;
      }),
    {},
    );
  };
}

module.exports = {
  merge: createMergeFunction({}),
  mergeWithCustomize: createMergeFunction,
  mergeWithRules: createMergeWithRulesFunction,
  unique: createUniqueFieldHandler,
};
