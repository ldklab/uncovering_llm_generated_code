const fs = require("fs");

// Utility to define properties
function defineProperty(target, name, attributes) {
  Object.defineProperty(target, name, attributes);
}

// Utility to export properties
function exportProperties(target, all) {
  for (let name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
}

// Utility for CommonJS exports
function toCommonJS(mod) {
  const target = {};
  defineProperty(target, "__esModule", { value: true });
  return copyProperties(target, mod);
}

// Utility to copy properties from one object to another
function copyProperties(to, from) {
  if (from && (typeof from === "object" || typeof from === "function")) {
    Object.getOwnPropertyNames(from).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(to, key)) {
        defineProperty(to, key, { 
          get: () => from[key], 
          enumerable: true 
        });
      }
    });
  }
  return to;
}

// Main function to calculate body length
function calculateBodyLength(body) {
  if (!body) return 0;
  if (typeof body === "string") {
    return Buffer.byteLength(body);
  }
  if (typeof body.byteLength === "number") {
    return body.byteLength;
  }
  if (typeof body.size === "number") {
    return body.size;
  }
  if (typeof body.start === "number" && typeof body.end === "number") {
    return body.end + 1 - body.start;
  }
  if (typeof body.path === "string" || Buffer.isBuffer(body.path)) {
    return fs.lstatSync(body.path).size;
  }
  if (typeof body.fd === "number") {
    return fs.fstatSync(body.fd).size;
  }
  throw new Error(`Body Length computation failed for ${body}`);
}

// Tag the function with a name
defineProperty(calculateBodyLength, "name", { value: "calculateBodyLength", configurable: true });

// Prepare export
const srcExports = {};
exportProperties(srcExports, { calculateBodyLength: () => calculateBodyLength });
module.exports = toCommonJS(srcExports);
