// index.js
module.exports = function (options = {}) {
  const { proto = false, circles = false, constructorHandlers = [] } = options;

  function clone(value, seen = new WeakMap()) {
    if (value === null || typeof value !== 'object') return value;

    if (circles && seen.has(value)) return seen.get(value);

    const isArr = Array.isArray(value);
    const result = isArr ? [] : Object.create(proto ? Object.getPrototypeOf(value) : null);

    if (circles) seen.set(value, result);

    const customHandler = constructorHandlers.find(([Ctor]) => value instanceof Ctor);
    if (customHandler) return customHandler[1](value);

    if (value instanceof Date) return new Date(value);
    if (Buffer.isBuffer(value)) return Buffer.from(value);

    if (value instanceof Map) {
      for (const [k, v] of value) result.set(k, clone(v, seen));
      return result;
    }
    if (value instanceof Set) {
      for (const v of value) result.add(clone(v, seen));
      return result;
    }
    if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
      return new value.constructor(value.buffer.slice());
    }

    for (const key of Reflect.ownKeys(value)) {
      if (key === '__proto__' && !proto) continue;
      result[key] = clone(value[key], seen);
    }

    return result;
  }

  return clone;
};

// default.js
const rfdc = require('./index');
module.exports = rfdc(); // Using default options with rfdc
