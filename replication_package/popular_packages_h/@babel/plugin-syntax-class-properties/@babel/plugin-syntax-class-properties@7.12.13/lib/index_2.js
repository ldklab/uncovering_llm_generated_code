"use strict";

// Import the necessary utility from Babel for creating a plugin
const { declare } = require("@babel/helper-plugin-utils");

// Define the plugin using Babel's plugin utilities
module.exports = declare(api => {
  // Ensure that this plugin is run with Babel version 7 or higher
  api.assertVersion(7);

  // Return the plugin configuration
  return {
    // Name of the plugin
    name: "syntax-class-properties",

    // Function to manipulate parser options
    manipulateOptions(opts, parserOpts) {
      // Add Babel plugins for various class-related syntax to the parser options
      parserOpts.plugins.push(
        "classProperties",        // Support for public class fields
        "classPrivateProperties", // Support for private class fields
        "classPrivateMethods"     // Support for private class methods
      );
    }
  };
});
