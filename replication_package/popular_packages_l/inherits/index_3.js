markdown
// package.json
{
  "name": "inherits",
  "version": "2.0.0",
  "main": "inherits.js",
  "browser": "inherits_browser.js"
}

// inherits.js (Node.js implementation)
const util = require('util');

module.exports = util.inherits;

// inherits_browser.js (Browser implementation with ES6 syntax)
module.exports = function inherits(subClass, superClass) {
  if (superClass) {
    subClass.super_ = superClass;
    subClass.prototype = Object.create(superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  }
};
