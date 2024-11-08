// defaults.js
function setDefaults(options, defaultValues) {
  // Initialize options as an empty object if it's falsy
  const finalOptions = options || {};

  // Iterate through each default value
  for (const key in defaultValues) {
    // Assign default value if the key is missing or undefined in options
    if (finalOptions[key] === undefined) {
      finalOptions[key] = defaultValues[key];
    }
  }

  // Return the options object with defaults applied
  return finalOptions;
}

module.exports = setDefaults;
