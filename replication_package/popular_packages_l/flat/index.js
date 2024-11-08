// flat.js

function flatten(target, opts = {}) {
  const delimiter = opts.delimiter || '.';
  const maxDepth = opts.maxDepth || Infinity;
  const safe = opts.safe || false;
  
  const output = {};

  function step(object, prev, currentDepth) {
    Object.keys(object).forEach(function(key) {
      const value = object[key];
      const newKey = prev ? prev + delimiter + key : key;
      const isObject = typeof value === 'object' && value !== null && !(value instanceof Date) && !(value instanceof RegExp);

      if (!safe && Array.isArray(value) || !isObject || currentDepth + 1 >= maxDepth) {
        output[newKey] = value;
      } else {
        step(value, newKey, currentDepth + 1);
      }
    });
  }

  step(target, '', 0);

  return output;
}

function unflatten(target, opts = {}) {
  const delimiter = opts.delimiter || '.';
  const overwrite = opts.overwrite || false;
  const object = opts.object || false;
  const safe = opts.safe || false;

  const isBuffer = typeof Buffer === 'function' && Buffer.isBuffer;

  if (Object(target) !== target || Array.isArray(target)) {
    return target;
  }

  const result = {};

  function getValue(key) {
    const keyArray = key.split(delimiter);
    return keyArray.reduce((res, keyPart) => {
      if (res === undefined) return undefined;
      return res[keyPart];
    }, result);
  }

  Object.keys(target).forEach(function(key) {
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
