const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, prototype } = Object;
const { Buffer } = require('buffer');
const { isArrayBuffer } = require('@smithy/is-array-buffer');

const __defProp = defineProperty;
const __getOwnPropDesc = getOwnPropertyDescriptor;
const __getOwnPropNames = getOwnPropertyNames;
const __hasOwnProp = prototype.hasOwnProperty;

const __name = (target, value) => __defProp(target, "name", { value, configurable: true });

const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};

const __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
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

const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts

const src_exports = {};
__export(src_exports, {
  fromArrayBuffer: () => fromArrayBuffer,
  fromString: () => fromString
});
module.exports = __toCommonJS(src_exports);

const fromArrayBuffer = /* @__PURE__ */ __name((input, offset = 0, length = input.byteLength - offset) => {
  if (!isArrayBuffer(input)) {
    throw new TypeError(`The "input" argument must be ArrayBuffer. Received type ${typeof input} (${input})`);
  }
  return Buffer.from(input, offset, length);
}, "fromArrayBuffer");

const fromString = /* @__PURE__ */ __name((input, encoding) => {
  if (typeof input !== "string") {
    throw new TypeError(`The "input" argument must be of type string. Received type ${typeof input} (${input})`);
  }
  return encoding ? Buffer.from(input, encoding) : Buffer.from(input);
}, "fromString");

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  fromArrayBuffer,
  fromString
});
