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

// inherits_browser.js (Browser implementation with old browser shim)
module.exports = function inherits(ctor, superCtor) {
  if (superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  }
};
