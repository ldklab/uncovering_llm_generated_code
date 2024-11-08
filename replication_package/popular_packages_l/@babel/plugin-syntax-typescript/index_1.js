const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare(api => {
  api.assertVersion(7);

  return {
    name: 'syntax-typescript',

    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push('typescript');
    }
  };
});

// To install this Babel plugin, run one of the following commands:
// Using npm
// npm install --save-dev @babel/plugin-syntax-typescript

// Using yarn
// yarn add @babel/plugin-syntax-typescript --dev

// This configuration should be included in your Babel configuration file for the plugin to take effect.
