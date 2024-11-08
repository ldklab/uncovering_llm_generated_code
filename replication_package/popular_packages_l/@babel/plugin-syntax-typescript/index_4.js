// Import necessary Babel helper for plugin declaration
const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare(api => {
  // Check compatibility with Babel version 7 or higher
  api.assertVersion(7);

  return {
    name: 'syntax-typescript', // Name the plugin

    // Modify parser options to include TypeScript syntax plugin
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push('typescript'); // Add TypeScript plugin
    },
  };
});

// Guide for installation, typically part of package documentation

// To install with npm:
// npm install --save-dev @babel/plugin-syntax-typescript

// To install with yarn:
// yarn add @babel/plugin-syntax-typescript --dev

// Note: This plugin setup is usually part of a larger Babel configuration file, such as babel.config.js.
