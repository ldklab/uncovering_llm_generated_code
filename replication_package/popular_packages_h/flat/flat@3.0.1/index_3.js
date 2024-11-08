const isBuffer = require('is-buffer');

const flat = module.exports = {
  flatten,
  unflatten
};

function flatten(target, opts = {}) {
  const delimiter = opts.delimiter || '.';
  const maxDepth = opts.maxDepth;
  const output = {};

  (function step(object, prev = '', currentDepth = 1) {
    for (const [key, value] of Object.entries(object)) {
      const isArray = opts.safe && Array.isArray(value);
      const isObject = Object.prototype.toString.call(value) === "[object Object]" || 
                       Object.prototype.toString.call(value) === "[object Array]";
      const newKey = prev ? `${prev}${delimiter}${key}` : key;

      if (!isArray && !isBuffer(value) && isObject && 
          Object.keys(value).length && 
          (!maxDepth || currentDepth < maxDepth)) {
        step(value, newKey, currentDepth + 1);
      } else {
        output[newKey] = value;
      }
    }
  })(target);

  return output;
}

function unflatten(target, opts = {}) {
  const delimiter = opts.delimiter || '.';
  const overwrite = opts.overwrite || false;
  const result = {};

  if (isBuffer(target) || Object.prototype.toString.call(target) !== '[object Object]') {
    return target;
  }

  function getkey(key) {
    const parsedKey = Number(key);
    return (isNaN(parsedKey) || key.includes('.') || opts.object) ? key : parsedKey;
  }

  for (const [key, value] of Object.entries(target)) {
    const split = key.split(delimiter);
    let key1 = getkey(split.shift());
    let key2 = getkey(split[0]);
    let recipient = result;

    while (key2 !== undefined) {
      if (key1 === '__proto__') return;

      const type = Object.prototype.toString.call(recipient[key1]);
      const isObject = type === "[object Object]" || type === "[object Array]";

      if (!overwrite && typeof recipient[key1] !== 'undefined' && !isObject) return;

      if ((overwrite && !isObject) || (!overwrite && recipient[key1] == null)) {
        recipient[key1] = (typeof key2 === 'number' && !opts.object) ? [] : {};
      }

      recipient = recipient[key1];
      if (split.length > 0) {
        key1 = getkey(split.shift());
        key2 = getkey(split[0]);
      }
    }

    recipient[key1] = unflatten(value, opts);
  }

  return result;
}
