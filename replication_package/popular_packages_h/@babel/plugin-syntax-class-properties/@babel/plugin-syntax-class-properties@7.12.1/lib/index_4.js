"use strict";

// Define an ES module and export the default export.
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// Import the 'declare' function from '@babel/helper-plugin-utils'.
var _helperPluginUtils = require("@babel/helper-plugin-utils");

// Call the 'declare' function to define the Babel plugin.
var _default = (0, _helperPluginUtils.declare)(api => {
  // Assert that the Babel version is at least 7.
  api.assertVersion(7);
  
  // Return the plugin configuration object.
  return {
    name: "syntax-class-properties", // Set the name of the plugin.

    // Define how options should be manipulated.
    manipulateOptions(opts, parserOpts) {
      // Add class property syntax plugins to the parser options.
      parserOpts.plugins.push(
        "classProperties",
        "classPrivateProperties",
        "classPrivateMethods"
      );
    }
  };
});

// Export the plugin as the default export.
exports.default = _default;
