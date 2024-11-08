// defaults.js
function defaults(options = {}, defaults = {}) {
  Object.keys(defaults).forEach((key) => {
    if (options[key] === undefined) {
      options[key] = defaults[key];
    }
  });
  return options;
}

module.exports = defaults;
