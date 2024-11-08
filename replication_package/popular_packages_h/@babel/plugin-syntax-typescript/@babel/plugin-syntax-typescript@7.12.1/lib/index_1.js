"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _helperPluginUtils = require("@babel/helper-plugin-utils");

// Function to remove specified plugins from the plugins array.
function removePlugin(plugins, name) {
  const indices = [];
  
  // Locate all indices of the plugin with a matching name.
  plugins.forEach((plugin, i) => {
    const n = Array.isArray(plugin) ? plugin[0] : plugin;

    if (n === name) {
      indices.unshift(i); // Store index at the start to maintain order.
    }
  });

  // Remove the plugins by their indices.
  for (const i of indices) {
    plugins.splice(i, 1);
  }
}

// Default export using Babel's helper plugin utility `declare` function.
var _default = (0, _helperPluginUtils.declare)((api, { isTSX }) => {
  api.assertVersion(7);
  
  return {
    name: "syntax-typescript",

    // Customize parser options when the plugin is applied.
    manipulateOptions(opts, parserOpts) {
      const { plugins } = parserOpts;
      
      // Remove 'flow' and 'jsx' plugins if they exist.
      removePlugin(plugins, "flow");
      removePlugin(plugins, "jsx");

      // Add TypeScript related plugins.
      parserOpts.plugins.push("typescript", "classProperties", "objectRestSpread");

      // Conditionally add 'jsx' if isTSX is true.
      if (isTSX) {
        parserOpts.plugins.push("jsx");
      }
    }
  };
});

// Export the default declared plugin.
exports.default = _default;
