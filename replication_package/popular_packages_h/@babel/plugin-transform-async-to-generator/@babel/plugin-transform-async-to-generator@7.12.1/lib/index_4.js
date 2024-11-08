"use strict";

import { declare } from "@babel/helper-plugin-utils";
import remapAsyncToGenerator from "@babel/helper-remap-async-to-generator";
import { addNamed } from "@babel/helper-module-imports";
import { types } from "@babel/core";

const transformAsyncToGenerator = declare((api, options) => {
  api.assertVersion(7);

  const { method, module } = options;

  return {
    name: "transform-async-to-generator",
    visitor: {
      Function(path, state) {
        if (!path.node.async || path.node.generator) return;

        let wrapAsync = state.methodWrapper;

        if (method && module) {
          if (wrapAsync) {
            wrapAsync = types.cloneNode(wrapAsync);
          } else {
            wrapAsync = state.methodWrapper = addNamed(path, method, module);
          }
        } else {
          wrapAsync = state.addHelper("asyncToGenerator");
        }

        remapAsyncToGenerator(path, { wrapAsync });
      }
    }
  };
});

export default transformAsyncToGenerator;
