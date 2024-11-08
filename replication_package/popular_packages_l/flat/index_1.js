// flat.js

function flatten(target, opts = {}) {
  const {
    delimiter = '.',
    maxDepth = Infinity,
    safe = false
  } = opts;

  const output = {};

  function step(obj, prevKey = '', depth = 0) {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = prevKey ? `${prevKey}${delimiter}${key}` : key;
      const isObject = typeof value === 'object' && value !== null && !(value instanceof Date) && !(value instanceof RegExp);

      if (!safe && Array.isArray(value) || !isObject || depth + 1 >= maxDepth) {
        output[newKey] = value;
      } else {
        step(value, newKey, depth + 1);
      }
    });
  }

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

  const isBufferCheck = typeof Buffer === 'function' && Buffer.isBuffer;
  
  if (typeof target !== 'object' || Array.isArray(target) || target === null) {
    return target;
  }

  const result = {};

  Object.keys(target).forEach(flatKey => {
    const keys = flatKey.split(delimiter);
    keys.reduce((accum, currentKey, idx) => {
      if (idx === keys.length - 1) {
        if (overwrite || accum[currentKey] === undefined) {
          accum[currentKey] = target[flatKey];
        }
      } else {
        if (accum[currentKey] === undefined || typeof accum[currentKey] !== 'object') {
          accum[currentKey] = !object && !safe && !isNaN(keys[idx + 1]) ? [] : {};
        }
      }
      return accum[currentKey];
    }, result);
  });

  return result;
}

module.exports = flatten;
module.exports.unflatten = unflatten;
