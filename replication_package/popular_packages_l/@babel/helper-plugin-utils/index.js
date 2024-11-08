markdown
// index.js
function declare(plugin) {
  return (api, options, dirname) => {
    if (!api.assertVersion) {
      throw new Error('api.assertVersion is not available, please use Babel 7+');
    }
    
    // Set the version compatibility
    api.assertVersion(7);

    // Call the plugin with Babel API, options, and the directory name
    return plugin(api, options || {}, dirname);
  };
}

function validateOptions(options, schema) {
  const errors = [];
  for (let key in schema) {
    if (schema.hasOwnProperty(key)) {
      const validation = schema[key](options[key]);
      if (validation !== true) {
        errors.push(validation);
      }
    }
  }
  
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
