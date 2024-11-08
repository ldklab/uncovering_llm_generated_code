const isBuffer = require('is-buffer');

const flat = module.exports = {
  flatten,
  unflatten
};

function flatten(target, opts = {}) {
  const delimiter = opts.delimiter || '.';
  const maxDepth = opts.maxDepth;
  const output = {};

  function step(object, prev = '', currentDepth = 1) {
    Object.keys(object).forEach(key => {
      const value = object[key];
      const isarray = opts.safe && Array.isArray(value);
      const type = Object.prototype.toString.call(value);
      const isbuffer = isBuffer(value);
      const isobject = type === "[object Object]" || type === "[object Array]";

      const newKey = prev ? prev + delimiter + key : key;

      if (!isarray && !isbuffer && isobject && Object.keys(value).length && 
          (!opts.maxDepth || currentDepth < maxDepth)) {
        return step(value, newKey, currentDepth + 1);
      }

      output[newKey] = value;
    });
  }

  step(target);
  return output;
}

function unflatten(target, opts = {}) {
  const delimiter = opts.delimiter || '.';
  const overwrite = opts.overwrite || false;
  const result = {};

  const isbuffer = isBuffer(target);
  if (isbuffer || Object.prototype.toString.call(target) !== '[object Object]') {
    return target;
  }

  function getkey(key) {
    const parsedKey = Number(key);
    return (isNaN(parsedKey) || key.indexOf('.') !== -1 || opts.object) ? key : parsedKey;
  }

  Object.keys(target).forEach(key => {
    const split = key.split(delimiter);
    let key1 = getkey(split.shift());
    let key2 = getkey(split[0]);
    let recipient = result;

    while (key2 !== undefined) {
      if (key1 === '__proto__') { return; }
      const type = Object.prototype.toString.call(recipient[key1]);
      const isobject = type === "[object Object]" || type === "[object Array]";

      if (!overwrite && !isobject && typeof recipient[key1] !== 'undefined') {
        return;
      }

      if ((overwrite && !isobject) || (!overwrite && recipient[key1] == null)) {
        recipient[key1] = (typeof key2 === 'number' && !opts.object) ? [] : {};
      }

      recipient = recipient[key1];
      if (split.length > 0) {
        key1 = getkey(split.shift());
        key2 = getkey(split[0]);
      }
    }

    recipient[key1] = unflatten(target[key], opts);
  });

  return result;
}
