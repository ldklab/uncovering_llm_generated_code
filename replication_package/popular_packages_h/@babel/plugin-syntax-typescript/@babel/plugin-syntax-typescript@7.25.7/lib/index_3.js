"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");

// Function to remove specific plugins from the plugins array
function removePlugin(plugins, name) {
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
}

const _default = exports.default = declare((api, opts) => {
  api.assertVersion(7);

  const { disallowAmbiguousJSXLike, dts, isTSX } = opts;

  return {
    name: "syntax-typescript",

    manipulateOptions(opts, parserOpts) {
      const { plugins } = parserOpts;

      // Remove existing 'flow' and 'jsx' plugins if they exist
      removePlugin(plugins, "flow");
      removePlugin(plugins, "jsx");

      // Add needed plugins
      plugins.push("objectRestSpread", "classProperties");

      // Add 'jsx' plugin if 'isTSX' option is true
      if (isTSX) {
        plugins.push("jsx");
      }

      // Add 'typescript' plugin with options
      parserOpts.plugins.push(["typescript", {
        disallowAmbiguousJSXLike,
        dts
      }]);
    }
  };
});

exports.default = _default;

//# sourceMappingURL=index.js.map
