const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

function copyProperties(target, source, except, desc) {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (let key of getOwnPropertyNames(source)) {
      if (!hasOwnProperty.call(target, key) && key !== except) {
        defineProperty(target, key, {
          get: () => source[key],
          enumerable: !(desc = getOwnPropertyDescriptor(source, key)) || desc.enumerable
        });
      }
    }
  }
  return target;
}

function reExport(target, module, secondTarget) {
  copyProperties(target, module, "default");
  if (secondTarget) {
    copyProperties(secondTarget, module, "default");
  }
}

function toCommonJS(module) {
  return copyProperties(defineProperty({}, "__esModule", { value: true }), module);
}

// src/index.ts
const exports = {};
module.exports = toCommonJS(exports);
reExport(exports, require("././resolveDefaultsModeConfig"), module.exports);

// Annotate the CommonJS export names for ESM import in node:

0 && (module.exports = {
  resolveDefaultsModeConfig
});
