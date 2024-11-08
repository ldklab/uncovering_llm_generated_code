// Helper functions for property definitions and retrievals
const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

// Function to assign a configurable name to a function or method
const assignName = (target, value) =>
  defineProperty(target, "name", { value, configurable: true });

// Function to export properties of an object
const exportProperties = (target, exports) => {
  for (let name in exports) {
    defineProperty(target, name, { get: exports[name], enumerable: true });
  }
};

// Function to copy properties from one object to another, with exceptions
const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable,
        });
      }
    }
  }
  return to;
};

// Function to wrap a module for CommonJS compatibility
const toCommonJS = (module) =>
  copyProperties(defineProperty({}, "__esModule", { value: true }), module);

// Exported functions
const srcExports = {};
exportProperties(srcExports, {
  getSmithyContext: () => getSmithyContext,
  normalizeProvider: () => normalizeProvider,
});
module.exports = toCommonJS(srcExports);

// Importing required dependencies
const { SMITHY_CONTEXT_KEY } = require("@smithy/types");

// getSmithyContext function
const getSmithyContext = /* @__PURE__ */ assignName((context) =>
  context[SMITHY_CONTEXT_KEY] || (context[SMITHY_CONTEXT_KEY] = {}), "getSmithyContext");

// normalizeProvider function
const normalizeProvider = /* @__PURE__ */ assignName((input) => {
  if (typeof input === "function") return input;
  const promisified = Promise.resolve(input);
  return () => promisified;
}, "normalizeProvider");

// Note: Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = { getSmithyContext, normalizeProvider });
