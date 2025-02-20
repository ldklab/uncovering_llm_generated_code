"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");
const remapAsyncToGenerator = require("@babel/helper-remap-async-to-generator").default;
const { addNamed } = require("@babel/helper-module-imports");
const { types: babelTypes } = require("@babel/core");

const transformAsyncToGenerator = declare((api, options) => {
  api.assertVersion("^7.0.0-0 || >8.0.0-alpha <8.0.0-beta");
  
  const { method, module } = options;
  const noNewArrows = api.assumption("noNewArrows") != null ? api.assumption("noNewArrows") : true;
  const ignoreFunctionLength = api.assumption("ignoreFunctionLength") != null ? api.assumption("ignoreFunctionLength") : false;

  return {
    name: "transform-async-to-generator",
    visitor: {
      Function(path, state) {
        if (!path.node.async || path.node.generator) return;

        let wrapAsync;
        
        if (method && module) {
          if (state.methodWrapper) {
            wrapAsync = babelTypes.cloneNode(state.methodWrapper);
          } else {
            wrapAsync = state.methodWrapper = addNamed(path, method, module);
          }
        } else {
          wrapAsync = state.addHelper("asyncToGenerator");
        }

        remapAsyncToGenerator(path, { wrapAsync }, noNewArrows, ignoreFunctionLength);
      }
    }
  };
});

exports.default = transformAsyncToGenerator;
