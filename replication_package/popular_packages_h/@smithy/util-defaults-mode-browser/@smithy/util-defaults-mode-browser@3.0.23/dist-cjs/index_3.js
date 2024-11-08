const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

function copyProperties(target, source, excludeKey, descriptor) {
  if (source && (typeof source === 'object' || typeof source === 'function')) {
    for (const key of getOwnPropertyNames(source)) {
      if (!hasOwnProperty.call(target, key) && key !== excludeKey) {
        defineProperty(target, key, { 
          get: () => source[key], 
          enumerable: !(descriptor = getOwnPropertyDescriptor(source, key)) || descriptor.enumerable 
        });
      }
    }
  }
  return target;
}

function reExport(target, module, secondaryTarget) {
  copyProperties(target, module, 'default');
  if (secondaryTarget) {
    copyProperties(secondaryTarget, module, 'default');
  }
}

function toCommonJS(module) {
  const commonJSModule = defineProperty({}, '__esModule', { value: true });
  return copyProperties(commonJSModule, module);
}

// src/index.ts
const srcExports = {};
module.exports = toCommonJS(srcExports);
reExport(srcExports, require('./resolveDefaultsModeConfig'), module.exports);

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  resolveDefaultsModeConfig
});
