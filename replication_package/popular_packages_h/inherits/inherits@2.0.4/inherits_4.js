try {
  const util = require('util');
  /* istanbul ignore next */
  if (typeof util.inherits === 'function') {
    module.exports = util.inherits;
  } else {
    throw new Error('util.inherits is not a function');
  }
} catch (error) {
  /* istanbul ignore next */
  module.exports = require('./inherits_browser.js');
}
