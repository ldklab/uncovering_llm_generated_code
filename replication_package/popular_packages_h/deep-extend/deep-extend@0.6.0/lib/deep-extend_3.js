'use strict';

const isSpecificValue = (val) => {
  return val instanceof Buffer || val instanceof Date || val instanceof RegExp;
};

const cloneSpecificValue = (val) => {
  if (val instanceof Buffer) {
    const x = Buffer.alloc ? Buffer.alloc(val.length) : new Buffer(val.length);
    val.copy(x);
    return x;
  } else if (val instanceof Date) {
    return new Date(val.getTime());
  } else if (val instanceof RegExp) {
    return new RegExp(val);
  } else {
    throw new Error('Unexpected situation');
  }
};

const deepCloneArray = (arr) => {
  return arr.map((item) => {
    if (typeof item === 'object' && item !== null) {
      if (Array.isArray(item)) {
        return deepCloneArray(item);
      } else if (isSpecificValue(item)) {
        return cloneSpecificValue(item);
      } else {
        return deepExtend({}, item);
      }
    } else {
      return item;
    }
  });
};

const safeGetProperty = (object, property) => {
  return property === '__proto__' ? undefined : object[property];
};

const deepExtend = function (target, ...sources) {
  if (!target || typeof target !== 'object') return false;
  if (sources.length === 0) return target;

  sources.forEach((obj) => {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return;

    Object.keys(obj).forEach((key) => {
      let src = safeGetProperty(target, key);
      const val = safeGetProperty(obj, key);

      if (val === target) return;

      if (typeof val !== 'object' || val === null) {
        target[key] = val;
      } else if (Array.isArray(val)) {
        target[key] = deepCloneArray(val);
      } else if (isSpecificValue(val)) {
        target[key] = cloneSpecificValue(val);
      } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
        target[key] = deepExtend({}, val);
      } else {
        target[key] = deepExtend(src, val);
      }
    });
  });

  return target;
};

module.exports = deepExtend;
