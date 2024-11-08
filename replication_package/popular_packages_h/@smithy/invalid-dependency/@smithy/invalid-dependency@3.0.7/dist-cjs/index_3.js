const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;

const __name = (target, value) => {
  __defProp(target, "name", { value, configurable: true });
};

const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, {
      get: all[name],
      enumerable: true
    });
  }
};

const __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

const __toCommonJS = (mod) => {
  return __copyProps(__defProp({}, "__esModule", { value: true }), mod);
};

// src/index.ts
const src_exports = {};
__export(src_exports, {
  invalidFunction: () => invalidFunction,
  invalidProvider: () => invalidProvider
});

module.exports = __toCommonJS(src_exports);

// src/invalidFunction.ts
const invalidFunction = /* @__PURE__ */ __name((message) => {
  return () => {
    throw new Error(message);
  };
}, "invalidFunction");

// src/invalidProvider.ts
const invalidProvider = /* @__PURE__ */ __name((message) => {
  return () => Promise.reject(message);
}, "invalidProvider");

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  invalidFunction,
  invalidProvider
});
