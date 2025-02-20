"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");

// Function to remove specific plugins by name from an array of plugins
function removePlugin(plugins, name) {
  const indicesToRemove = [];
  
  // Identify indices of plugins with the specified name to remove
  plugins.forEach((plugin, index) => {
    const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;
    if (pluginName === name) {
      indicesToRemove.unshift(index);
    }
  });

  // Remove the plugins at the identified indices
  for (const index of indicesToRemove) {
    plugins.splice(index, 1);
  }
}

// Export a Babel plugin declaration
const defaultExport = declare((api, options) => {
  const { isTSX } = options;
  api.assertVersion(7); // Ensure the Babel version is 7

  return {
    name: "syntax-typescript",

    // Hook to manipulate options before parsing
    manipulateOptions(opts, parserOpts) {
      const { plugins } = parserOpts;
      
      // Remove "flow" and "jsx" plugins if present
      removePlugin(plugins, "flow");
      removePlugin(plugins, "jsx");

      // Add TypeScript-related plugins
      parserOpts.plugins.push("typescript", "classProperties", "objectRestSpread");

      // Conditionally add the "jsx" plugin if isTSX is true
      if (isTSX) {
        parserOpts.plugins.push("jsx");
      }
    }
  };
});

exports.default = defaultExport;
