const cloneDeep = require('lodash.clonedeep');

module.exports = function(options, defaults) {
  options = options || {};

  for (const key in defaults) {
    if (defaults.hasOwnProperty(key) && typeof options[key] === 'undefined') {
      options[key] = cloneDeep(defaults[key]);
    }
  }

  return options;
};
