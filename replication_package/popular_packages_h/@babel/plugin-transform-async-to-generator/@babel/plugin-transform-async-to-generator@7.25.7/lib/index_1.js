"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");
const remapAsyncToGenerator = require("@babel/helper-remap-async-to-generator");
const { addNamed } = require("@babel/helper-module-imports");
const { types: t } = require("@babel/core");

const transformAsyncToGeneratorPlugin = (api, options) => {
  api.assertVersion("^7.0.0-0 || >8.0.0-alpha <8.0.0-beta");

  const { method, module } = options;
  const noNewArrows = api.assumption("noNewArrows") ?? true;
  const ignoreFunctionLength = api.assumption("ignoreFunctionLength") ?? false;

  const visitor = {
    Function(path, state) {
      if (!path.node.async || path.node.generator) return;

      let wrapAsync;
      if (method && module) {
        wrapAsync = state.methodWrapper;
        if (!wrapAsync) {
          wrapAsync = state.methodWrapper = addNamed(path, method, module);
        } else {
          wrapAsync = t.cloneNode(wrapAsync);
        }
      } else {
        wrapAsync = state.addHelper("asyncToGenerator");
      }

      remapAsyncToGenerator.default(path, { wrapAsync }, noNewArrows, ignoreFunctionLength);
    }
  };

  return {
    name: "transform-async-to-generator",
    visitor,
  };
};

exports.default = declare(transformAsyncToGeneratorPlugin);
