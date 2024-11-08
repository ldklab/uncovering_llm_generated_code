// Import the helper plugin utils from Babel
const { declare } = require('@babel/helper-plugin-utils');

// Export a Babel plugin module using the declare function
module.exports = declare(api => {
  // Check if the Babel version being used is compatible (version 7 or higher)
  api.assertVersion(7);

  // Return the plugin configuration object
  return {
    // Name of the plugin
    name: 'syntax-typescript',

    // Function to manipulate parser options
    manipulateOptions(opts, parserOpts) {
      // Add the 'typescript' plugin to the Babel parser options
      parserOpts.plugins.push('typescript');
    },
  };
});

// Installation instructions provided as comments

// Install the plugin using npm
// npm install --save-dev @babel/plugin-syntax-typescript

// Alternatively, install the plugin using yarn
// yarn add @babel/plugin-syntax-typescript --dev

// Note: This plugin is intended to be used as part of a Babel configuration
// to enable TypeScript syntax parsing by Babel, often configured in a file like babel.config.js.
