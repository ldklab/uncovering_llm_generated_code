const __defineProperty = Object.defineProperty;
const __getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const __getOwnPropertyNames = Object.getOwnPropertyNames;
const __hasOwnProperty = Object.prototype.hasOwnProperty;

const __exportName = (target, value) => __defineProperty(target, "name", { value, configurable: true });
const __exportProperties = (target, all) => {
  for (const name in all) {
    __defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const __copyProperties = (to, from, except, descriptor) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of __getOwnPropertyNames(from)) {
      if (!__hasOwnProperty.call(to, key) && key !== except) {
        __defineProperty(to, key, { 
          get: () => from[key], 
          enumerable: !(descriptor = __getOwnPropertyDescriptor(from, key)) || descriptor.enumerable 
        });
      }
    }
  }
  return to;
};

const __convertToCommonJS = (mod) => __copyProperties(__defineProperty({}, "__esModule", { value: true }), mod);

// src/index.ts
const srcExports = {};
__exportProperties(srcExports, {
  invalidFunction: () => invalidFunction,
  invalidProvider: () => invalidProvider
});
module.exports = __convertToCommonJS(srcExports);

// src/invalidFunction.ts
const invalidFunction = /* @__PURE__ */ __exportName((message) => () => {
  throw new Error(message);
}, "invalidFunction");

// src/invalidProvider.ts
const invalidProvider = /* @__PURE__ */ __exportName((message) => () => Promise.reject(message), "invalidProvider");

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  invalidFunction,
  invalidProvider
});
