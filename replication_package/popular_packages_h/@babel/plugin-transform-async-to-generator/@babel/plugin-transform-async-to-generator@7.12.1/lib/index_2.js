"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");
const remapAsyncToGenerator = require("@babel/helper-remap-async-to-generator").default;
const { addNamed } = require("@babel/helper-module-imports");
const { types: t } = require("@babel/core");

const transformAsyncToGeneratorPlugin = declare((api, options) => {
  api.assertVersion(7);
  const { method, module } = options;

  function transformFunction(path, state) {
    if (!path.node.async || path.node.generator) return;

    let wrapAsync;

    if (method && module) {
      wrapAsync = state.methodWrapper;
      if (wrapAsync) {
        wrapAsync = t.cloneNode(wrapAsync);
      } else {
        wrapAsync = state.methodWrapper = addNamed(path, method, module);
      }
    } else {
      wrapAsync = state.addHelper("asyncToGenerator");
    }

    remapAsyncToGenerator(path, { wrapAsync });
  }

  return {
    name: "transform-async-to-generator",
    visitor: {
      Function: transformFunction
    }
  };
});

exports.default = transformAsyncToGeneratorPlugin;
