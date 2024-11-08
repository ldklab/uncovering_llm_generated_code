"use strict";

// Utility functions for object property manipulation
const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

// Define a function that facilitates the export of properties
const exportProperties = (target, properties) => {
  for (const key in properties) {
    defineProperty(target, key, { get: properties[key], enumerable: true });
  }
};

// Function to copy properties from source to target
const copyProperties = (target, source, except, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (let key of getOwnPropertyNames(source)) {
      if (!hasOwnProperty.call(target, key) && key !== except) {
        defineProperty(target, key, {
          get: () => source[key],
          enumerable: !(descriptor = getOwnPropertyDescriptor(source, key)) || descriptor.enumerable,
        });
      }
    }
  }
  return target;
};

const convertToCommonJS = (module) => copyProperties(defineProperty({}, "__esModule", { value: true }), module);

// Module implementation
const srcExports = {};
exportProperties(srcExports, {
  AbortController: () => importTypes.AbortController,
  // ... other exports
  HostAddressType: () => HostAddressType,
});

module.exports = convertToCommonJS(srcExports);

// Import from external module
const importTypes = require("@smithy/types");

// Define enumeration
const HostAddressType = (() => {
  const type = {};
  type["AAAA"] = "AAAA";
  type["A"] = "A";
  return type;
})();

// Additional code annotations can be incorporated here
// 0 && (module.exports = { HttpAuthLocation, HostAddressType, EndpointURLScheme, RequestHandlerProtocol });
