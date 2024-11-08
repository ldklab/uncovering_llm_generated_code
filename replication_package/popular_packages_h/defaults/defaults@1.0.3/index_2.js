const cloneDeep = require('clone');

function mergeOptionsWithDefaults(options = {}, defaults) {
  Object.entries(defaults).forEach(([key, value]) => {
    if (options[key] === undefined) {
      options[key] = cloneDeep(value);
    }
  });
  return options;
}

module.exports = mergeOptionsWithDefaults;
