const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare((api) => {
  // Ensure compatibility with Babel 7 or above
  api.assertVersion("^7.0.0");

  return {
    name: 'syntax-jsx',  // Identifies the plugin
    
    // Configure Babel to parse JSX syntax
    manipulateOptions(options, parserOptions) {
      // Enable the JSX plugin in Babel's parser configuration
      parserOptions.plugins.push('jsx');
    }
  };
});
