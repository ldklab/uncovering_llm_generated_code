"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");
const remapAsyncToGenerator = require("@babel/helper-remap-async-to-generator").default;
const { addNamed } = require("@babel/helper-module-imports");
const { types } = require("@babel/core");

function transformAsyncToGenerator(api, options) {
  api.assertVersion("^7.0.0-0 || >8.0.0-alpha <8.0.0-beta");

  const {
    method,
    module
  } = options;
  
  const noNewArrows = api.assumption("noNewArrows") ?? true;
  const ignoreFunctionLength = api.assumption("ignoreFunctionLength") ?? false;

  const visitorFunction = (path, state) => {
    if (!path.node.async || path.node.generator) return;

    let wrapAsync = state.methodWrapper;
    if (wrapAsync) {
      wrapAsync = types.cloneNode(wrapAsync);
    } else if (method && module) {
      wrapAsync = state.methodWrapper = addNamed(path, method, module);
    } else {
      wrapAsync = state.addHelper("asyncToGenerator");
    }

    remapAsyncToGenerator(path, { wrapAsync }, noNewArrows, ignoreFunctionLength);
  };

  return {
    name: "transform-async-to-generator",
    visitor: {
      Function: visitorFunction
    }
  };
}

exports.default = declare(transformAsyncToGenerator);
