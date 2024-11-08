let inherits;

try {
  const util = require('util');

  if (typeof util.inherits === 'function') {
    inherits = util.inherits;
  }
} catch (e) {
  // No operation is needed here since we will handle it outside the try-catch
}

if (!inherits) {
  inherits = require('./inherits_browser.js');
}

module.exports = inherits;
