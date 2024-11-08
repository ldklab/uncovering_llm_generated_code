"use strict";

// Utility function definitions
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;

// Function to export properties to a target
const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};

// Function to copy properties from one object to another
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

// Function to convert a module to a CommonJS module
const __toCommonJS = (mod) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// Importing types from "@smithy/types"
const import_types = require("@smithy/types");

// Define types related to DNS
const HostAddressType = /* @__PURE__ */ ((HostAddressType2) => {
  HostAddressType2["AAAA"] = "AAAA";
  HostAddressType2["A"] = "A";
  return HostAddressType2;
})(HostAddressType || {});

// Setting up exports
const src_exports = {};

// Export functions to harmonize names across the imported types
__export(src_exports, {
  AbortController: () => import_types.AbortController,
  AbortHandler: () => import_types.AbortHandler,
  // ... (all other exports),
  HostAddressType: () => HostAddressType,
  // ... (possibly more)
});

// Exporting the constructed module
module.exports = __toCommonJS(src_exports);

// Additional modules imports and related code for other src files omitted for brevity
