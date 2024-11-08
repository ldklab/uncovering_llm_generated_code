const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const copyProperties = (target, source, exclude, descriptor) => {
  if (source && (typeof source === 'object' || typeof source === 'function')) {
    for (const key of getOwnPropertyNames(source)) {
      if (!hasOwnProperty.call(target, key) && key !== exclude) {
        defineProperty(target, key, {
          get: () => source[key],
          enumerable: !(descriptor = getOwnPropertyDescriptor(source, key)) || descriptor.enumerable,
        });
      }
    }
  }
  return target;
};

const reExport = (target, mod, secondTarget) => {
  copyProperties(target, mod, "default");
  if (secondTarget) {
    copyProperties(secondTarget, mod, "default");
  }
};

const toCommonJS = (mod) => {
  return copyProperties(defineProperty({}, "__esModule", { value: true }), mod);
};

// src/index.ts
const srcExports = {};
module.exports = toCommonJS(srcExports);
reExport(srcExports, require('././fromBase64'), module.exports);
reExport(srcExports, require('././toBase64'), module.exports);

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  fromBase64,
  toBase64
});
