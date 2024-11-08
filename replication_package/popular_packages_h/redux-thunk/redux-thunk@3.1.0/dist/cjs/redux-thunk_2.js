"use strict";

// Utility functions to facilitate CommonJS and ESM compatibility
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;

// Export utility function
const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};

// Copy properties utility function
const __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
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

// Wrap module for CommonJS
const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
const src_exports = {};

// Exporting thunk functions
__export(src_exports, {
  thunk: () => thunk,
  withExtraArgument: () => withExtraArgument
});

module.exports = __toCommonJS(src_exports);

// Function to create Redux thunk middleware
function createThunkMiddleware(extraArgument) {
  const middleware = ({ dispatch, getState }) => (next) => (action) => {
    // Check if action is a function
    if (typeof action === "function") {
      // Call the function with dispatch, getState, and extraArgument
      return action(dispatch, getState, extraArgument);
    }
    // Otherwise, continue with the next middleware/action
    return next(action);
  };
  
  return middleware;
}

// Default thunk middleware without extra arguments
const thunk = createThunkMiddleware();

// Middleware factory for custom extra arguments
const withExtraArgument = createThunkMiddleware;

// Annotate the CommonJS export names for ESM import:
0 && (module.exports = {
  thunk,
  withExtraArgument
});
