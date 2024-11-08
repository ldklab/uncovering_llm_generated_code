// cloneFactory.js
module.exports = function ({ proto = false, circles = false, constructorHandlers = [] } = {}) {
  const clone = (input, map = new WeakMap()) => {
    if (input === null || typeof input !== 'object') return input;

    if (circles && map.has(input)) return map.get(input);

    const inputIsArray = Array.isArray(input);
    const output = inputIsArray ? [] : Object.create(proto ? Object.getPrototypeOf(input) : null);

    if (circles) map.set(input, output);

    const specializedHandler = constructorHandlers.find(([Constructor]) => input instanceof Constructor);
    if (specializedHandler) return specializedHandler[1](input);

    if (input instanceof Date) return new Date(input);
    if (Buffer.isBuffer(input)) return Buffer.from(input);
    if (input instanceof Map) {
      const clonedMap = new Map();
      input.forEach((value, key) => clonedMap.set(key, clone(value, map)));
      return clonedMap;
    }
    if (input instanceof Set) {
      const clonedSet = new Set();
      input.forEach(value => clonedSet.add(clone(value, map)));
      return clonedSet;
    }
    if (ArrayBuffer.isView(input) && !(input instanceof DataView)) return new input.constructor(input);

    Reflect.ownKeys(input).forEach((key) => {
      if (key !== '__proto__' || proto) {
        output[key] = clone(input[key], map);
      }
    });

    return output;
  };

  return clone;
};

// cloneDefault.js
const cloneFactory = require('./cloneFactory');
module.exports = cloneFactory({ proto: false, circles: false, constructorHandlers: [] });
