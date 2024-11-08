// Import the required Babel types
const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare((api) => {
  // Ensure the plugin works with the version of Babel being used
  api.assertVersion("^7.0.0");

  return {
    name: 'syntax-jsx',  // Plugin name
    
    // Introduce a new parser plugin for Babel to interpret JSX syntax
    manipulateOptions(opts, parserOpts) {
      // Add the 'jsx' parser plugin to the list of plugins in Babel's parser
      parserOpts.plugins.push('jsx');
    }
  };
});
