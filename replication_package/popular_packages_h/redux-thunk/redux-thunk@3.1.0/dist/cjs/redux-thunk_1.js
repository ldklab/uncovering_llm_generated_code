"use strict";

// Define utility functions for object property manipulation
const defineProperty = (target, name, descriptor) => 
  Object.defineProperty(target, name, descriptor);

const getOwnPropertyNames = (obj) => 
  Object.getOwnPropertyNames(obj);

const hasOwnProperty = (obj, prop) => 
  Object.prototype.hasOwnProperty.call(obj, prop);

const copyProperties = (target, source, except) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (let key of getOwnPropertyNames(source)) {
      if (!hasOwnProperty(target, key) && key !== except) {
        defineProperty(target, key, {
          get: () => source[key],
          enumerable: true
        });
      }
    }
  }
  return target;
};

const toCommonJS = (module) => 
  copyProperties(defineProperty({}, "__esModule", { value: true }), module);

// Define the middleware for Redux
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => (next) => (action) => {
    if (typeof action === "function") {
      return action(dispatch, getState, extraArgument);
    }
    return next(action);
  };
}

const thunk = createThunkMiddleware();
const withExtraArgument = createThunkMiddleware;

// Export the middleware using CommonJS
const exports = { thunk, withExtraArgument };
module.exports = toCommonJS(exports);
