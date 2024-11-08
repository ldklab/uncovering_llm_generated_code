// Utility functions for property management
const defineProperty = Object.defineProperty;
const getOwnPropDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProp = Object.prototype.hasOwnProperty;

// Utility to copy properties from one object to another
function copyProperties(target, source, excludeKey, descriptor) {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (const key of getOwnPropertyNames(source)) {
      if (!hasOwnProp.call(target, key) && key !== excludeKey) {
        const desc = getOwnPropDescriptor(source, key);
        defineProperty(target, key, { get: () => source[key], enumerable: !descriptor || desc.enumerable });
      }
    }
  }
  return target;
}

// Re-export modules by copying properties
function reExport(target, module, additionalTarget) {
  copyProperties(target, module, "default");
  if (additionalTarget) {
    copyProperties(additionalTarget, module, "default");
  }
}

// Function to convert to CommonJS module
function toCommonJSModule(module) {
  return copyProperties(defineProperty({}, "__esModule", { value: true }), module);
}

// Main module exports
const exports = {};
module.exports = toCommonJSModule(exports);

// Re-export from external modules
reExport(exports, require("././fromBase64"), module.exports);
reExport(exports, require("././toBase64"), module.exports);

// Prepare CommonJS exports with annotated names
0 && (module.exports = {
  fromBase64,
  toBase64
});
