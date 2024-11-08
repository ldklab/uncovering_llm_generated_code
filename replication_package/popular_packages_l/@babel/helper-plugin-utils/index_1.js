// index.js
function declare(plugin) {
  return (api, options = {}, dirname) => {
    if (!api.assertVersion) {
      throw new Error('api.assertVersion is not available, please use Babel 7+');
    }
    
    api.assertVersion(7);
    return plugin(api, options, dirname);
  };
}

function validateOptions(options, schema) {
  const errors = Object.entries(schema)
    .map(([key, validate]) => validate(options[key]))
    .filter(validation => validation !== true);
  
  if (errors.length > 0) {
    throw new Error(`Invalid options:\n${errors.join('\n')}`);
  }
}

function pluginUtilFactory() {
  return {
    declare,
    validateOptions,
  };
}

module.exports = pluginUtilFactory();
