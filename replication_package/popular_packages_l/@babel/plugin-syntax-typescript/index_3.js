// Import Babel's helper function for plugin creation
const { declare } = require('@babel/helper-plugin-utils');

// Export a Babel plugin module
module.exports = declare(api => {
  // Check that the Babel version is 7 or above
  api.assertVersion(7);

  // Return the plugin configuration
  return {
    name: 'syntax-typescript', // Name of the plugin

    // Configure the Babel parser to support TypeScript syntax
    manipulateOptions(opts, parserOpts) {
      // Add 'typescript' to the parser plugins
      parserOpts.plugins.push('typescript');
    },
  };
});

// Instructions for installation should be documented separately
// To install via npm
// npm install --save-dev @babel/plugin-syntax-typescript

// To install via yarn
// yarn add @babel/plugin-syntax-typescript --dev

// Note: This plugin should be part of a Babel configuration, typically specified in a babel.config.js file.
