const util = require('util');
let inherits;

if (typeof util.inherits === 'function') {
  inherits = util.inherits;
} else {
  inherits = require('./inherits_browser.js');
}

module.exports = inherits;
