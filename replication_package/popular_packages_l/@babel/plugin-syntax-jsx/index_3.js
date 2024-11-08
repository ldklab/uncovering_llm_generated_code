const { declare } = require('@babel/helper-plugin-utils');

module.exports = declare((api) => {
  api.assertVersion("^7.0.0");
  
  return {
    name: 'syntax-jsx',
    
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push('jsx');
    }
  };
});
