// flat.js

function flatten(target, opts = {}) {
  const {
    delimiter = '.',
    maxDepth = Infinity,
    safe = false
  } = opts;

  const output = {};

  const step = (object, prev = '', currentDepth = 0) => {
    Object.keys(object).forEach((key) => {
      const value = object[key];
      const newKey = prev ? `${prev}${delimiter}${key}` : key;
      const isObject = (
        typeof value === 'object' &&
        value !== null &&
        !(value instanceof Date) &&
        !(value instanceof RegExp)
      );

      if (!safe && Array.isArray(value) || !isObject || currentDepth + 1 >= maxDepth) {
        output[newKey] = value;
      } else {
        step(value, newKey, currentDepth + 1);
      }
    });
  };

  step(target);

  return output;
}

function unflatten(target, opts = {}) {
  const {
    delimiter = '.',
    overwrite = false,
    object = false,
    safe = false
  } = opts;

  if (Object(target) !== target || Array.isArray(target)) {
    return target;
  }

  const result = {};

  Object.keys(target).forEach((key) => {
    const keys = key.split(delimiter);
    keys.reduce((acc, currentKey, index) => {
      if (index === keys.length - 1) {
        if (overwrite || acc[currentKey] === undefined) {
          acc[currentKey] = target[key];
        }
      } else {
        if (acc[currentKey] === undefined || typeof acc[currentKey] !== 'object') {
          acc[currentKey] = !object && !safe && !isNaN(keys[index + 1]) ? [] : {};
        }
      }
      return acc[currentKey];
    }, result);
  });

  return result;
}

module.exports = flatten;
module.exports.unflatten = unflatten;
