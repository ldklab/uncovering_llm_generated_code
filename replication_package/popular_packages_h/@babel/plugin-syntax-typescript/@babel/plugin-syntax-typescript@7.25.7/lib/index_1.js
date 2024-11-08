"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");

/**
 * Helper function to remove a plugin by name from the plugins array.
 * @param {Array} plugins - Array of Babel plugins.
 * @param {string} name - Name of the plugin to remove.
 */
function removePlugin(plugins, name) {
  const indices = [];
  plugins.forEach((plugin, i) => {
    const n = Array.isArray(plugin) ? plugin[0] : plugin;
    if (n === name) {
      indices.unshift(i);
    }
  });
  for (const i of indices) {
    plugins.splice(i, 1);
  }
}

/**
 * Babel plugin that configures parser options for TypeScript support.
 * It removes unwanted plugins and adds necessary plugins based on options.
 */
const babelPluginSyntaxTypeScript = declare((api, opts) => {
  api.assertVersion(7);

  const {
    disallowAmbiguousJSXLike,
    dts,
    isTSX
  } = opts;

  return {
    name: "syntax-typescript",
    manipulateOptions(opts, parserOpts) {
      const { plugins } = parserOpts;

      // Remove plugins that are not needed.
      removePlugin(plugins, "flow");
      removePlugin(plugins, "jsx");

      // Add required plugins for TypeScript.
      plugins.push("objectRestSpread", "classProperties");

      // If isTSX option is true, include JSX plugin for TSX support.
      if (isTSX) {
        plugins.push("jsx");
      }

      // Add TypeScript plugin with options.
      parserOpts.plugins.push(["typescript", {
        disallowAmbiguousJSXLike,
        dts
      }]);
    }
  };
});

exports.default = babelPluginSyntaxTypeScript;

//# sourceMappingURL=index.js.map
