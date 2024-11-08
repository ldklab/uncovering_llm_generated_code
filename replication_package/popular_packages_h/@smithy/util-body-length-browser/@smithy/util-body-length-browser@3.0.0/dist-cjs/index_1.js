const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames } = Object;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const assignFunctionName = (fn, name) => defineProperty(fn, 'name', { value: name, configurable: true });

const exportFunctions = (target, functions) => {
  for (const name in functions) {
    defineProperty(target, name, { get: functions[name], enumerable: true });
  }
};

const copyProperties = (to, from, except) => {
  if (from && (typeof from === 'object' || typeof from === 'function')) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        const desc = getOwnPropertyDescriptor(from, key);
        defineProperty(to, key, { get: () => from[key], enumerable: !desc || desc.enumerable });
      }
    }
  }
  return to;
};

const convertToCommonJS = (mod) => copyProperties(defineProperty({}, '__esModule', { value: true }), mod);

// Module exporting
const srcExports = {};
exportFunctions(srcExports, {
  calculateBodyLength: () => calculateBodyLength
});
module.exports = convertToCommonJS(srcExports);

// Calculate body length utility
const textEncoder = typeof TextEncoder === 'function' ? new TextEncoder() : null;

const calculateBodyLength = assignFunctionName((body) => {
  if (typeof body === 'string') {
    if (textEncoder) {
      return textEncoder.encode(body).byteLength;
    }
    let length = body.length;
    for (let i = length - 1; i >= 0; i--) {
      const code = body.charCodeAt(i);
      if (code > 127 && code <= 2047) length++;
      else if (code > 2047 && code <= 65535) length += 2;
      if (code >= 56320 && code <= 57343) i--; // Skip surrogate pairs
    }
    return length;
  } else if (typeof body.byteLength === 'number') {
    return body.byteLength;
  } else if (typeof body.size === 'number') {
    return body.size;
  }
  throw new Error(`Body Length computation failed for ${body}`);
}, 'calculateBodyLength');
