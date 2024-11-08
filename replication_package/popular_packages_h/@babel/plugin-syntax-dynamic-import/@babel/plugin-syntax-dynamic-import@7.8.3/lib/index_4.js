"use strict";

// Importing the declare function from @babel/helper-plugin-utils
const { declare } = require("@babel/helper-plugin-utils");

// Exporting a default function using Babel's declare utility
module.exports = declare(api => {
  // Ensure the Babel API version is adequate (version 7+)
  api.assertVersion(7);
  
  // Return the plugin configuration object
  return {
    // Define the name of the plugin
    name: "syntax-dynamic-import",

    // Function to manipulate parser options
    manipulateOptions(opts, parserOpts) {
      // Adding the `dynamicImport` plugin to the parser options
      parserOpts.plugins.push("dynamicImport");
    }
  };
});
