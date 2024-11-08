"use strict";

const ObjectHelpers = {
  defineProperty: Object.defineProperty,
  getOwnPropertyDescriptor: Object.getOwnPropertyDescriptor,
  getOwnPropertyNames: Object.getOwnPropertyNames,
  hasOwnProperty: Object.prototype.hasOwnProperty,
};

const utilities = {
  exportAll: (target, all) => {
    for (const name in all) {
      ObjectHelpers.defineProperty(target, name, { get: all[name], enumerable: true });
    }
  },
  copyProperties: (to, from, except, desc) => {
    if (from && (typeof from === "object" || typeof from === "function")) {
      for (const key of ObjectHelpers.getOwnPropertyNames(from)) {
        if (!ObjectHelpers.hasOwnProperty.call(to, key) && key !== except) {
          ObjectHelpers.defineProperty(to, key, { get: () => from[key], enumerable: !(desc = ObjectHelpers.getOwnPropertyDescriptor(from, key)) || desc.enumerable });
        }
      }
    }
    return to;
  },
  toCommonJS: (mod) => utilities.copyProperties(ObjectHelpers.defineProperty({}, "__esModule", { value: true }), mod),
};

// Main module export
const src_exports = {};
const import_types = require("@smithy/types");

utilities.exportAll(src_exports, {
  AbortController: () => import_types.AbortController,
  // ... similar lines for other exports
  randomValues: () => import_types.randomValues
});

// Export module
module.exports = utilities.toCommonJS(src_exports);

// Definitions from other files
const HostAddressType = /* @__PURE__ */ ((HostAddressTypeDef) => {
  HostAddressTypeDef["AAAA"] = "AAAA";
  HostAddressTypeDef["A"] = "A";
  return HostAddressTypeDef;
})(HostAddressType || {});

// Dummy exports to satisfy possible ESM imports
0 && (module.exports = {
  HttpAuthLocation,
  HostAddressType,
  EndpointURLScheme,
  RequestHandlerProtocol
});
