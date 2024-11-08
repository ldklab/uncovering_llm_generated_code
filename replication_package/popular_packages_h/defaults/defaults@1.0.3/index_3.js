const clone = require('clone');

module.exports = function mergeOptionsWithDefaults(userOptions, defaultOptions) {
  // Ensure userOptions is an object or initialize to an empty object
  const options = userOptions || {};

  // Iterate over each key in the defaultOptions object
  for (const key in defaultOptions) {
    // Check if the key is own property of defaultOptions
    if (defaultOptions.hasOwnProperty(key)) {
      // If the key is not present in userOptions
      if (typeof options[key] === 'undefined') {
        // Clone the value from defaultOptions to options
        options[key] = clone(defaultOptions[key]);
      }
    }
  }

  // Return the merged options object
  return options;
};
