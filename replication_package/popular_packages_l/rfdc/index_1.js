// index.js
function cloneUtility(opts = { proto: false, circles: false, constructorHandlers: [] }) {
  const { proto, circles, constructorHandlers } = opts;

  const clone = (input, map = new WeakMap()) => {
    if (input === null || typeof input !== 'object') return input;

    if (circles && map.has(input)) return map.get(input);

    let output = Array.isArray(input) ? [] : Object.create(proto ? Object.getPrototypeOf(input) : null);

    if (circles) map.set(input, output);

    const constructorHandler = constructorHandlers.find(([cons]) => input instanceof cons);
    if (constructorHandler) return constructorHandler[1](input);

    if (input instanceof Date) return new Date(input);
    if (Buffer.isBuffer(input)) return Buffer.from(input);
    if (input instanceof Map) {
      output = new Map();
      for (let [key, value] of input) output.set(key, clone(value, map));
      return output;
    }
    if (input instanceof Set) {
      output = new Set();
      for (let value of input) output.add(clone(value, map));
      return output;
    }
    if (ArrayBuffer.isView(input) && !(input instanceof DataView)) return new input.constructor(input);

    Reflect.ownKeys(input).forEach((key) => {
      if (key === '__proto__' && !proto) return;
      output[key] = clone(input[key], map);
    });

    return output;
  };

  return clone;
}

module.exports = cloneUtility;

// default.js
const cloneUtility = require('./index');
module.exports = cloneUtility({ proto: false, circles: false, constructorHandlers: [] });