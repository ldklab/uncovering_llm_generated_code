const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const setName = (target, value) => defineProperty(target, 'name', { value, configurable: true });

const exportAll = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === 'object' || typeof from === 'function')) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, { 
          get: () => from[key],
          enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable 
        });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProperties(defineProperty({}, '__esModule', { value: true }), mod);

// src/index.js
const exportsObj = {};
exportAll(exportsObj, {
  calculateBodyLength: () => calculateBodyLength
});
module.exports = toCommonJS(exportsObj);

// src/calculateBodyLength.js
const TEXT_ENCODER = typeof TextEncoder === "function" ? new TextEncoder() : null;

const calculateBodyLength = setName((body) => {
  if (typeof body === 'string') {
    if (TEXT_ENCODER) {
      return TEXT_ENCODER.encode(body).byteLength;
    }
    let length = body.length;
    for (let i = length - 1; i >= 0; i--) {
      const code = body.charCodeAt(i);
      if (code > 127 && code <= 2047) {
        length++;
      } else if (code > 2047 && code <= 65535) {
        length += 2;
      }
      if (code >= 56320 && code <= 57343) {
        i--;
      }
    }
    return length;
  } else if (typeof body.byteLength === 'number') {
    return body.byteLength;
  } else if (typeof body.size === 'number') {
    return body.size;
  }
  throw new Error(`Body Length computation failed for ${body}`);
}, 'calculateBodyLength');
