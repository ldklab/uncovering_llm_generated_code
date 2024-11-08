const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const addFunctionName = (func, name) => 
  defineProperty(func, "name", { value: name, configurable: true });

const exportProperties = (target, properties) => {
  for (const key in properties) {
    defineProperty(target, key, { get: properties[key], enumerable: true });
  }
};

const copyProperties = (to, from, exception, descriptor) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== exception) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !(descriptor = getOwnPropertyDescriptor(from, key)) || descriptor.enumerable,
        });
      }
    }
  }
  return to;
};

const toCommonJSModule = (module) => 
  copyProperties(defineProperty({}, "__esModule", { value: true }), module);

const srcExports = {};

exportProperties(srcExports, {
  getSmithyContext: () => getSmithyContext,
  normalizeProvider: () => normalizeProvider
});

module.exports = toCommonJSModule(srcExports);

// src/getSmithyContext.js
const { SMITHY_CONTEXT_KEY } = require("@smithy/types");

const getSmithyContext = addFunctionName((context) => {
  return context[SMITHY_CONTEXT_KEY] || (context[SMITHY_CONTEXT_KEY] = {});
}, "getSmithyContext");

// src/normalizeProvider.js
const normalizeProvider = addFunctionName((input) => {
  if (typeof input === "function") return input;
  const promisified = Promise.resolve(input);
  return () => promisified;
}, "normalizeProvider");

0 && (module.exports = {
  getSmithyContext,
  normalizeProvider
});
