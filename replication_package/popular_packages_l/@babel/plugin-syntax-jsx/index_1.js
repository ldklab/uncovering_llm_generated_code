// Import the required Babel types
const { declare } = require('@babel/helper-plugin-utils');

// Define and export a Babel plugin using the declare function
module.exports = declare((api) => {
  // Check compatibility with Babel version using assertVersion
  api.assertVersion("^7.0.0");

  return {
    name: 'syntax-jsx',  // Define the name of the plugin

    manipulateOptions(opts, parserOpts) {
      // Add the 'jsx' parser plugin to enable JSX syntax parsing in Babel
      parserOpts.plugins.push('jsx');
    }
  };
});
