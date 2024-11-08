"use strict";

import { declare } from "@babel/helper-plugin-utils";
import remapAsyncToGenerator from "@babel/helper-remap-async-to-generator";
import { addNamed } from "@babel/helper-module-imports";
import { types as babelTypes } from "@babel/core";

export default declare((api, options) => {
  api.assertVersion("^7.0.0-0 || >8.0.0-alpha <8.0.0-beta");

  const { method, module } = options;
  const noNewArrows = api.assumption("noNewArrows") ?? true;
  const ignoreFunctionLength = api.assumption("ignoreFunctionLength") ?? false;

  if (method && module) {
    return {
      name: "transform-async-to-generator",
      visitor: {
        Function(path, state) {
          if (!path.node.async || path.node.generator) return;

          let wrapAsync = state.methodWrapper;
          if (wrapAsync) {
            wrapAsync = babelTypes.cloneNode(wrapAsync);
          } else {
            wrapAsync = state.methodWrapper = addNamed(path, method, module);
          }

          remapAsyncToGenerator(path, { wrapAsync }, noNewArrows, ignoreFunctionLength);
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
        }, noNewArrows, ignoreFunctionLength);
      }
    }
  };
});

//# sourceMappingURL=index.js.map
