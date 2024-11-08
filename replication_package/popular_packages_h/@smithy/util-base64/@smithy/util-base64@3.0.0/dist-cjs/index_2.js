const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const copyProperties = (target, source, excludeKey, desc) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (const key of getOwnPropertyNames(source)) {
      if (!hasOwnProperty.call(target, key) && key !== excludeKey) {
        defineProperty(target, key, { 
          get: () => source[key], 
          enumerable: !(desc = getOwnPropertyDescriptor(source, key)) || desc.enumerable 
        });
      }
    }
  }
  return target;
};

const reExport = (target, module, altTarget) => {
  copyProperties(target, module, "default");
  if (altTarget) copyProperties(altTarget, module, "default");
};

const toCommonJS = (module) => copyProperties(defineProperty({}, "__esModule", { value: true }), module);

// src/index.ts
const srcExports = {};
module.exports = toCommonJS(srcExports);
reExport(srcExports, require("././fromBase64"), module.exports);
reExport(srcExports, require("././toBase64"), module.exports);

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  fromBase64,
  toBase64
});
