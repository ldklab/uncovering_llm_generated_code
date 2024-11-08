// Utility functions for property management
const defineProp = Object.defineProperty;
const getOwnPropDesc = Object.getOwnPropertyDescriptor;
const getOwnPropNames = Object.getOwnPropertyNames;
const hasOwnProp = Object.prototype.hasOwnProperty;

const nameFunction = (target, value) => {
  defineProp(target, "name", { value, configurable: true });
};

const exportModule = (target, exports) => {
  for (const prop in exports) {
    defineProp(target, prop, { get: exports[prop], enumerable: true });
  }
};

const copyProperties = (to, from, exclude) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropNames(from)) {
      if (!hasOwnProp.call(to, key) && key !== exclude) {
        defineProp(to, key, { 
          get: () => from[key], 
          enumerable: !(desc = getOwnPropDesc(from, key)) || desc.enumerable 
        });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => {
  return copyProperties(defineProp({}, "__esModule", { value: true }), mod);
};

// Exported functions from src
const srcExports = {};
exportModule(srcExports, {
  getSmithyContext: () => getSmithyContext,
  normalizeProvider: () => normalizeProvider
});
module.exports = toCommonJS(srcExports);

// Function to get the Smithy context
const importTypes = require("@smithy/types");
const getSmithyContext = nameFunction((context) => {
  return context[importTypes.SMITHY_CONTEXT_KEY] || (context[importTypes.SMITHY_CONTEXT_KEY] = {});
}, "getSmithyContext");

// Function to normalize a provider
const normalizeProvider = nameFunction((input) => {
  if (typeof input === "function") return input;
  const promisified = Promise.resolve(input);
  return () => promisified;
}, "normalizeProvider");

// Annotation for ESM import
0 && (module.exports = {
  getSmithyContext,
  normalizeProvider
});
