// Utility functions
const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const setFunctionName = (target, value) => 
  defineProperty(target, "name", { value, configurable: true });

const exportProperties = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, { 
          get: () => from[key], 
          enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable 
        });
      }
    }
  }
  return to;
};

const toCommonJSModule = (mod) => 
  copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// src/index.ts
const srcExports = {};
exportProperties(srcExports, {
  getSmithyContext: () => getSmithyContext,
  normalizeProvider: () => normalizeProvider
});
module.exports = toCommonJSModule(srcExports);

// src/getSmithyContext.ts
const { SMITHY_CONTEXT_KEY } = require("@smithy/types");

const getSmithyContext = setFunctionName((context) => 
  context[SMITHY_CONTEXT_KEY] || (context[SMITHY_CONTEXT_KEY] = {}), "getSmithyContext");

// src/normalizeProvider.ts
const normalizeProvider = setFunctionName((input) => {
  if (typeof input === "function") return input;
  const promisified = Promise.resolve(input);
  return () => promisified;
}, "normalizeProvider");

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getSmithyContext,
  normalizeProvider
});
