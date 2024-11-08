"use strict";

exports.__esModule = true;
exports.default = void 0;

const definePolyfillProvider = require("@babel/helper-define-polyfill-provider").default;

const runtimeCompat = "#__secret_key__@babel/runtime__compatibility";

function isRegenerator(meta) {
  return meta.kind === "global" && meta.name === "regeneratorRuntime";
}

function shallowEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

const regeneratorPlugin = definePolyfillProvider(({ debug, targets, babel }, options) => {
  if (!shallowEqual(targets, babel.targets())) {
    throw new Error(
      "This plugin does not use the targets option. Only preset-env's targets" +
      " or top-level targets need to be configured for this plugin to work." +
      " See https://github.com/babel/babel-polyfills/issues/36 for more" +
      " details."
    );
  }

  const {
    [runtimeCompat]: {
      moduleName = null,
      useBabelRuntime = false
    } = {}
  } = options;

  return {
    name: "regenerator",
    polyfills: ["regenerator-runtime"],
    usageGlobal(meta, utils) {
      if (isRegenerator(meta)) {
        debug("regenerator-runtime");
        utils.injectGlobalImport("regenerator-runtime/runtime.js");
      }
    },
    usagePure(meta, utils, path) {
      if (isRegenerator(meta)) {
        let pureName = "regenerator-runtime";
        if (useBabelRuntime) {
          const runtimeName = moduleName || path.hub.file.get("runtimeHelpersModuleName") || "@babel/runtime";
          pureName = `${runtimeName}/regenerator`;
        }
        path.replaceWith(utils.injectDefaultImport(pureName, "regenerator-runtime"));
      }
    }
  };
});

exports.default = regeneratorPlugin;
