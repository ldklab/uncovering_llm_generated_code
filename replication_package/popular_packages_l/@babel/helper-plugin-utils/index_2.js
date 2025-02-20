// index.js
function declare(plugin) {
  return (api, options, dirname) => {
    // Check if api.assertVersion is available
    if (!api.assertVersion) {
      throw new Error('api.assertVersion is not available, please use Babel 7+');
    }
    
    // Ensure the Babel version is 7 or greater
    api.assertVersion(7);

    // Execute the plugin function passing in Babel API, options, and dirname
    return plugin(api, options || {}, dirname);
  };
}

function validateOptions(options, schema) {
  const errors = [];
  // Iterate over schema keys and validate corresponding options
  for (let key in schema) {
    if (schema.hasOwnProperty(key)) {
      const validation = schema[key](options[key]);
      // Collect any validation errors
      if (validation !== true) {
        errors.push(validation);
      }
    }
  }
  
  // If there are errors, throw an error with all validation messages
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

// Export the utility functions for use in Babel plugin development
module.exports = pluginUtilFactory();
