"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");

const removePlugin = (plugins, name) => {
  const indices = [];
  plugins.forEach((plugin, i) => {
    const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;
    if (pluginName === name) {
      indices.unshift(i);
    }
  });
  for (const i of indices) {
    plugins.splice(i, 1);
  }
};

exports.default = declare((api, opts) => {
  api.assertVersion(7);
  
  const { disallowAmbiguousJSXLike, dts } = opts;
  const { isTSX } = opts;

  return {
    name: "syntax-typescript",
    manipulateOptions(opts, parserOpts) {
      const { plugins } = parserOpts;
      removePlugin(plugins, "flow");
      removePlugin(plugins, "jsx");

      plugins.push("objectRestSpread", "classProperties");

      if (isTSX) {
        plugins.push("jsx");
      }

      parserOpts.plugins.push([
        "typescript", {
          disallowAmbiguousJSXLike,
          dts
        }
      ]);
    }
  };
});

//# sourceMappingURL=index.js.map
