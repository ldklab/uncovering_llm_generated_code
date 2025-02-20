// index.js
function declare(plugin) {
  return (api, options, dirname) => {
    if (!api.assertVersion) {
      throw new Error('api.assertVersion is not available, please use Babel 7+');
    }
    
    // Ensure the Babel version is 7 or above
    api.assertVersion(7);

    // Return the plugin with the provided API, options, and directory name
    return plugin(api, options || {}, dirname);
  };
}

function validateOptions(options, schema) {
  const errors = [];
  for (const key in schema) {
    if (Object.prototype.hasOwnProperty.call(schema, key)) {
      const validation = schema[key](options[key]);
      if (validation !== true) {
        errors.push(validation);
      }
    }
  }
  
  // Throw an error with all validation errors if any exist
  if (errors.length > 0) {
    throw new Error(`Invalid options:\n${errors.join('\n')}`);
  }
}

function pluginUtilFactory() {
  // Expose the declare and validateOptions utility functions
  return {
    declare,
    validateOptions,
  };
}

module.exports = pluginUtilFactory();
