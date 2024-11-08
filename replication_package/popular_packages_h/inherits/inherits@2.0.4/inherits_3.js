const util = require('util');

function getInheritsFunction() {
  if (typeof util.inherits === 'function') {
    return util.inherits;
  }
  return require('./inherits_browser.js');
}

module.exports = getInheritsFunction();
