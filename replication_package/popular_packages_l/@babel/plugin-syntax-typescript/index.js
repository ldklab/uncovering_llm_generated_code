// Import necessary Babel types
const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare(api => {
  // Ensure we're using a compatible Babel version
  api.assertVersion(7);

  return {
    name: 'syntax-typescript',

    // Include TypeScript syntax plugins
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push('typescript');
    },
  };
});

// Installation instructions, which is part of the package.json script or documentation

// Using npm to install the package
// npm install --save-dev @babel/plugin-syntax-typescript

// Using yarn to install the package
// yarn add @babel/plugin-syntax-typescript --dev

// Note: This code should be part of a larger Babel configuration setup, usually specified in the Babel configuration file (e.g., babel.config.js).
