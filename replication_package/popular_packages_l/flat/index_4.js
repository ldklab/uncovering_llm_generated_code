// flat.js

/**
 * Flattens a nested JavaScript object into a single-level object with delimiter-separated keys.
 * 
 * @param {Object} target - Target object to flatten.
 * @param {Object} opts - Options for flattening.
 * @returns {Object} - Flattened object.
 */
function flatten(target, opts = {}) {
  const delimiter = opts.delimiter || '.';
  const maxDepth = opts.maxDepth || Infinity;
  const safe = opts.safe || false;
  const output = {};

  function step(object, prevKey, currentDepth) {
    Object.keys(object).forEach(key => {
      const value = object[key];
      const newKey = prevKey ? `${prevKey}${delimiter}${key}` : key;
      const isObject = typeof value === 'object' && value !== null && 
                       !(value instanceof Date) && !(value instanceof RegExp);

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

/**
 * Unflattens a flat object with delimiter-separated keys into a nested JavaScript object.
 * 
 * @param {Object} target - Flat object to unflatten.
 * @param {Object} opts - Options for unflattening.
 * @returns {Object} - Unflattened object.
 */
function unflatten(target, opts = {}) {
  const delimiter = opts.delimiter || '.';
  const overwrite = opts.overwrite || false;
  const object = opts.object || false;
  const safe = opts.safe || false;

  if (Object(target) !== target || Array.isArray(target)) {
    return target;
  }

  const result = {};

  Object.keys(target).forEach(key => {
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

// Exporting functions
module.exports = flatten;
module.exports.unflatten = unflatten;
