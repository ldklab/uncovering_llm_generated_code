// defaults.js
function defaults(options, defaults) {
  // If options is falsy (null, undefined, false, etc.), initialize it as an empty object
  options = options || {};

  // Loop over each key/value in defaults
  for (var key in defaults) {
    // If the key is not already in options, or if the value in options is undefined
    if (options[key] === undefined) {
      // Set the key in options to the value from defaults
      options[key] = defaults[key];
    }
  }

  // Return the merged options object
  return options;
}

module.exports = defaults;
