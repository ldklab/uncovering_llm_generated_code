// index.js
import { serialize, deserialize } from './structuredClone';
import { stringify, parse } from './json';

function structuredClone(value, options = {}) {
  const serialized = serialize(value, options);
  return deserialize(serialized);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = structuredClone;
  module.exports.serialize = serialize;
  module.exports.deserialize = deserialize;
  module.exports.json = { stringify, parse };
}

// structuredClone.js
export function serialize(value, options = {}) {
  const { lossy = false, json = false } = options;
  return JSON.stringify(value, (key, value) => {
    if (typeof value === 'function' || typeof value === 'symbol') {
      if (lossy || json) return null;
      throw new TypeError('Cannot serialize functions or symbols');
    }
    if (json && typeof value.toJSON === 'function') {
      return value.toJSON();
    }
    return value;
  });
}

export function deserialize(serialized) {
  return JSON.parse(serialized);
}

// json.js
export function stringify(value) {
  return serialize(value, { lossy: true, json: true });
}

export function parse(serialized) {
  return deserialize(serialized);
}
