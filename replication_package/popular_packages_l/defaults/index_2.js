// defaults.js
function applyDefaults(options, defaultValues) {
  const appliedOptions = options || {};

  for (const key in defaultValues) {
    if (!(key in appliedOptions)) {
      appliedOptions[key] = defaultValues[key];
    }
  }

  return appliedOptions;
}

module.exports = applyDefaults;
