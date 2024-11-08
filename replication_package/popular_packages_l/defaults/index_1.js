// defaults.js
function defaults(options = {}, defaults) {
  // Use Object.keys to iterate over the defaults object's keys
  Object.keys(defaults).forEach(key => {
    // If a key is not present or undefined in options, set it from defaults
    if (options[key] === undefined) {
      options[key] = defaults[key];
    }
  });

  // Return the merged options object
  return options;
}

module.exports = defaults;
