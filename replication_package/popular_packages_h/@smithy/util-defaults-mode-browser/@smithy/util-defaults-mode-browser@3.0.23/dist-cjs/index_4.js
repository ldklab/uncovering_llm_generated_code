const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const copyProperties = (target, source, excludeKey, descriptor) => {
  if ((source && typeof source === 'object') || typeof source === 'function') {
    for (const key of getOwnPropertyNames(source)) {
      if (!hasOwnProperty.call(target, key) && key !== excludeKey) {
        const desc = getOwnPropertyDescriptor(source, key);
        defineProperty(target, key, { 
          get: () => source[key], 
          enumerable: !desc || desc.enumerable 
        });
      }
    }
  }
  return target;
};

const reExport = (target, module, secondTarget) => {
  copyProperties(target, module, "default");
  if (secondTarget) {
    copyProperties(secondTarget, module, "default");
  }
};

const toCommonJS = (module) => {
  return copyProperties(defineProperty({}, "__esModule", { value: true }), module);
};

// src/index.ts
const exportsObject = {};
module.exports = toCommonJS(exportsObject);
reExport(exportsObject, require("././resolveDefaultsModeConfig"), module.exports);

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = { resolveDefaultsModeConfig });
