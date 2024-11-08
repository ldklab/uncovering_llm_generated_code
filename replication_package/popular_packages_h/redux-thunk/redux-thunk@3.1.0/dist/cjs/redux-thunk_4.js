"use strict";

// Utility functions for defining properties and copying properties for module exports
const defineProperty = Object.defineProperty;
const getOwnPropDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropNames = Object.getOwnPropertyNames;
const hasOwnProp = Object.prototype.hasOwnProperty;

const exportModule = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropNames(from)) {
      if (!hasOwnProp.call(to, key) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !(desc = getOwnPropDescriptor(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// Middleware creation function
function createThunkMiddleware(extraArgument) {
  const middleware = ({ dispatch, getState }) => (next) => (action) => {
    if (typeof action === "function") {
      return action(dispatch, getState, extraArgument);
    }
    return next(action);
  };
  return middleware;
}

// Exports
const src_exports = {};
exportModule(src_exports, {
  thunk: () => thunkMiddleware,
  withExtraArgument: () => createThunkMiddleware
});
module.exports = toCommonJS(src_exports);

const thunkMiddleware = createThunkMiddleware();

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  thunk: thunkMiddleware,
  withExtraArgument: createThunkMiddleware
});
