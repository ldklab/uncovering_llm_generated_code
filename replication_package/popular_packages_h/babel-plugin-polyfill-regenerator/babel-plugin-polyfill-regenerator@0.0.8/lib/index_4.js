"use strict";

exports.__esModule = true;
exports.default = void 0;

var definePolyfillProvider = require("@babel/helper-define-polyfill-provider").default;

const regeneratorPolyfillProvider = definePolyfillProvider(({ debug }) => {
  return {
    name: "regenerator",
    polyfills: ["regenerator-runtime"],

    usageGlobal(meta, utils) {
      if (isRegenerator(meta)) {
        debug("regenerator-runtime");
        utils.injectGlobalImport("regenerator-runtime/runtime");
      }
    },

    usagePure(meta, utils, path) {
      if (isRegenerator(meta)) {
        path.replaceWith(utils.injectDefaultImport("regenerator-runtime"));
      }
    }
  };
});

exports.default = regeneratorPolyfillProvider;

const isRegenerator = meta => meta.kind === "global" && meta.name === "regeneratorRuntime";
