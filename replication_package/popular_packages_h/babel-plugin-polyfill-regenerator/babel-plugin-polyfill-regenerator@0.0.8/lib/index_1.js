"use strict";

exports.__esModule = true;
exports.default = void 0;

const definePolyfillProvider = require("@babel/helper-define-polyfill-provider").default;

const isRegenerator = (meta) => meta.kind === "global" && meta.name === "regeneratorRuntime";

const regeneratorProvider = definePolyfillProvider(({ debug }) => ({
  name: "regenerator",
  polyfills: ["regenerator-runtime"],

  usageGlobal(meta, utils) {
    if (isRegenerator(meta)) {
      debug("Injecting global import for regenerator-runtime");
      utils.injectGlobalImport("regenerator-runtime/runtime");
    }
  },

  usagePure(meta, utils, path) {
    if (isRegenerator(meta)) {
      path.replaceWith(utils.injectDefaultImport("regenerator-runtime"));
    }
  },
}));

exports.default = regeneratorProvider;
