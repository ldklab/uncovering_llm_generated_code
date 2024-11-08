const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const copyProperties = (target, source, excludeKey, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (const key of getOwnPropertyNames(source)) {
      if (!hasOwnProperty.call(target, key) && key !== excludeKey) {
        defineProperty(target, key, {
          get: () => source[key],
          enumerable: !(descriptor = getOwnPropertyDescriptor(source, key)) || descriptor.enumerable,
        });
      }
    }
  }
  return target;
};

const reExport = (target, moduleContent, secondTarget) => {
  copyProperties(target, moduleContent, "default");
  if (secondTarget) {
    copyProperties(secondTarget, moduleContent, "default");
  }
};

const toCommonJS = (moduleContent) => copyProperties(defineProperty({}, "__esModule", { value: true }), moduleContent);

const srcExports = {};
module.exports = toCommonJS(srcExports);
reExport(srcExports, require("././resolveDefaultsModeConfig"), module.exports);

// Annotation for conditional re-export (currently unused but prepared for ESM imports)
0 && (module.exports = {
  resolveDefaultsModeConfig,
});
