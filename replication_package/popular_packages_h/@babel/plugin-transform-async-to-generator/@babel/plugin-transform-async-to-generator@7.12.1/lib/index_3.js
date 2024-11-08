"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");
const remapAsyncToGenerator = require("@babel/helper-remap-async-to-generator").default;
const { addNamed } = require("@babel/helper-module-imports");
const { types: t } = require("@babel/core");

const _default = declare((api, options) => {
  api.assertVersion(7);
  const { method, module } = options;

  if (method && module) {
    return {
      name: "transform-async-to-generator",
      visitor: {
        Function(path, state) {
          if (!path.node.async || path.node.generator) return;

          let wrapAsync = state.methodWrapper;

          if (wrapAsync) {
            wrapAsync = t.cloneNode(wrapAsync);
          } else {
            wrapAsync = state.methodWrapper = addNamed(path, method, module);
          }

          remapAsyncToGenerator(path, { wrapAsync });
        }
      }
    };
  }

  return {
    name: "transform-async-to-generator",
    visitor: {
      Function(path, state) {
        if (!path.node.async || path.node.generator) return;
        remapAsyncToGenerator(path, {
          wrapAsync: state.addHelper("asyncToGenerator")
        });
      }
    }
  };
});

exports.default = _default;
