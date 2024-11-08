const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

// Helper functions
const setFunctionName = (func, name) => defineProperty(func, "name", { value: name, configurable: true });

const exportFunctions = (target, functions) => {
  for (const name in functions) {
    defineProperty(target, name, { get: functions[name], enumerable: true });
  }
};

const copyProperties = (target, source, exclude, desc) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    const keys = getOwnPropertyNames(source);
    for (const key of keys) {
      if (!hasOwnProperty.call(target, key) && key !== exclude) {
        defineProperty(target, key, {
          get: () => source[key],
          enumerable: !(desc = getOwnPropertyDescriptor(source, key)) || desc.enumerable,
        });
      }
    }
  }
  return target;
};

const toCommonJSExport = (module) =>
  copyProperties(defineProperty({}, "__esModule", { value: true }), module);

// Source code
const exports = {};

// Define and export functions
exportFunctions(exports, {
  invalidFunction: () => invalidFunction,
  invalidProvider: () => invalidProvider,
});

module.exports = toCommonJSExport(exports);

// Function definitions
const invalidFunction = /* @__PURE__ */ setFunctionName((message) => () => {
  throw new Error(message);
}, "invalidFunction");

const invalidProvider = /* @__PURE__ */ setFunctionName((message) => () => Promise.reject(message), "invalidProvider");

// Compatibility annotation for Node.js
0 && (module.exports = {
  invalidFunction,
  invalidProvider,
});
