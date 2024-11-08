"use strict";

// Utility functions for module exports
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;

// Function to export properties to a target object
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// Function to copy properties from one object to another, excluding specified keys
var __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { 
          get: () => from[key], 
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable 
        });
  }
  return to;
};

// Converts a module to CommonJS format
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// Index for exporting types
var src_exports = {};

// Export multiple types from the @smithy/types module
__export(src_exports, {
  AbortController: () => import_types.AbortController,
  // ... (all other exports)
  HostAddressType: () => HostAddressType,
  // ... (other exports continue)
});

// Convert src_exports to CommonJS module
module.exports = __toCommonJS(src_exports);

// Import types from the @smithy/types package
var import_types = require("@smithy/types");

// Define a specific enum (HostAddressType) for DNS records
var HostAddressType = ((HostAddressType) => {
  HostAddressType["AAAA"] = "AAAA";
  HostAddressType["A"] = "A";
  return HostAddressType;
})(HostAddressType || {});

// The rest of the code structure would continue similarly
