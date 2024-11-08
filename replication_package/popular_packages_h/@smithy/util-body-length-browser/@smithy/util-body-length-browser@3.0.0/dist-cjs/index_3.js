// Module system helper functions
const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

// Define the 'name' property on target with configurable option
const setName = (target, value) => defineProperty(target, "name", { value, configurable: true });

// Export all properties from 'all' onto 'target'
const exportAll = (target, all) => {
  for (let name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

// Copy properties from 'from' to 'to', except for the 'except' key
const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, { get: () => from[key], enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
};

// Convert the module to CommonJS
const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// src/index.ts
const srcExports = {};
exportAll(srcExports, {
  calculateBodyLength: () => calculateBodyLength
});
module.exports = toCommonJS(srcExports);

// src/calculateBodyLength.ts
const TEXT_ENCODER = typeof TextEncoder === "function" ? new TextEncoder() : null;

const calculateBodyLength = setName((body) => {
  if (typeof body === "string") {
    if (TEXT_ENCODER) {
      return TEXT_ENCODER.encode(body).byteLength;
    }
    
    let length = body.length;
    for (let i = length - 1; i >= 0; i--) {
      const code = body.charCodeAt(i);
      if (code > 127 && code <= 2047) length++;
      else if (code > 2047 && code <= 65535) length += 2;
      if (code >= 56320 && code <= 57343) i--; // Surrogate pair adjustment
    }
    return length;
  } else if (typeof body.byteLength === "number") {
    return body.byteLength;
  } else if (typeof body.size === "number") {
    return body.size;
  }
  
  throw new Error(`Body Length computation failed for ${body}`);
}, "calculateBodyLength");
