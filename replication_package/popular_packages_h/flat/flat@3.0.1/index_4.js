const isBuffer = require('is-buffer');

const flat = module.exports = { flatten, unflatten };

function flatten(target, opts = {}) {
  const delimiter = opts.delimiter || '.';
  const maxDepth = opts.maxDepth;
  const output = {};

  function step(object, prevKey = '', currentDepth = 1) {
    for (const key of Object.keys(object)) {
      const value = object[key];
      const isArray = opts.safe && Array.isArray(value);
      const isObj = isBuffer(value) ||
                    Object.prototype.toString.call(value) === '[object Object]' ||
                    Object.prototype.toString.call(value) === '[object Array]';

      const newKey = prevKey ? `${prevKey}${delimiter}${key}` : key;

      if (!isArray && !isBuffer(value) && isObj && Object.keys(value).length &&
          (!opts.maxDepth || currentDepth < maxDepth)) {
        step(value, newKey, currentDepth + 1);
      } else {
        output[newKey] = value;
      }
    }
  }

  step(target);
  return output;
}

function unflatten(target, opts = {}) {
  const delimiter = opts.delimiter || '.';
  const overwrite = opts.overwrite || false;
  const result = {};

  if (isBuffer(target) || Object.prototype.toString.call(target) !== '[object Object]') {
    return target;
  }

  const getKey = (key) => isNaN(Number(key)) || key.includes('.') || opts.object ? key : Number(key);

  for (const key of Object.keys(target)) {
    const split = key.split(delimiter);
    const firstKey = getKey(split.shift());
    let currentLevel = result;

    while (split.length > 0) {
      const nextKey = getKey(split[0]);
      if (firstKey === '__proto__') return;

      const type = Object.prototype.toString.call(currentLevel[firstKey]);
      const currentIsObj = type === '[object Object]' || type === '[object Array]';

      if (!overwrite && currentLevel[firstKey] !== undefined && !currentIsObj) {
        return;
      }

      if ((overwrite && !currentIsObj) || currentLevel[firstKey] == null) {
        currentLevel[firstKey] = typeof nextKey === 'number' && !opts.object ? [] : {};
      }

      currentLevel = currentLevel[firstKey];
      split.shift();
    }

    currentLevel[firstKey] = unflatten(target[key], opts);
  }

  return result;
}
