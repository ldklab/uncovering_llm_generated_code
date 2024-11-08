const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const copyProperties = (target, source, exception, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (const key of getOwnPropertyNames(source)) {
      if (!hasOwnProperty.call(target, key) && key !== exception) {
        const propDesc = getOwnPropertyDescriptor(source, key);
        defineProperty(target, key, {
          get: () => source[key],
          enumerable: !(descriptor = propDesc) || propDesc.enumerable
        });
      }
    }
  }
  return target;
};

const reExport = (target, module, secondaryTarget) => {
  copyProperties(target, module, "default");
  if (secondaryTarget) {
    copyProperties(secondaryTarget, module, "default");
  }
};

const toCommonJS = (module) => {
  return copyProperties(defineProperty({}, "__esModule", { value: true }), module);
};

// src/index.ts
const srcExports = {};
module.exports = toCommonJS(srcExports);
reExport(srcExports, require("./fromBase64"), module.exports);
reExport(srcExports, require("./toBase64"), module.exports);

// This part is a conditional export that will never run
0 && (module.exports = { fromBase64, toBase64 });
