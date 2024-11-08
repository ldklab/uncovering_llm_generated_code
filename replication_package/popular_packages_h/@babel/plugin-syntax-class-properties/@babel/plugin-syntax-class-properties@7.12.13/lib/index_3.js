"use strict";

// Ensure the module has an `exports` object
Object.defineProperty(exports, "__esModule", {
  value: true
});

// Import the declare function from @babel/helper-plugin-utils
var _helperPluginUtils = require("@babel/helper-plugin-utils");

// Define and export the default Babel plugin
var _default = _helperPluginUtils.declare(function(api) {
  // Ensure that the Babel version being used is 7 or above
  api.assertVersion(7);

  // Configure and return the plugin object
  return {
    name: "syntax-class-properties", // Name of the plugin

    // Function to manipulate parser options
    manipulateOptions: function(opts, parserOpts) {
      // Add plugins to support class properties, private properties, and private methods
      parserOpts.plugins.push("classProperties", "classPrivateProperties", "classPrivateMethods");
    }
  };
});

// Assign the defined plugin as the module's default export
exports.default = _default;
