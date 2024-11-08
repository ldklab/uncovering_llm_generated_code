markdown
// package.json
{
  "name": "inherits",
  "version": "2.0.0",
  "main": "inherits.js",
  "browser": "inherits_browser.js"
}

// inherits.js (Node.js implementation)
var util = require('util');

// Exports the `inherits` function from the 'util' module,
// which implements prototypal inheritance in Node.js.
module.exports = util.inherits;

// inherits_browser.js (Browser implementation with old browser shim)
module.exports = function inherits(ctor, superCtor) {
  if (superCtor) {
    // Set the `super_` property to the superclass constructor.
    ctor.super_ = superCtor;

    // Create a new object using the superclass's prototype and
    // assign it to the subclass's prototype. This establishes
    // inheritance from `superCtor`.
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,           // Ensure newly created object's constructor points to `ctor`.
        enumerable: false,     // Hide the constructor property while iterating over properties.
        writable: true,        // Allow the constructor reference to be changed if needed.
        configurable: true     // Allow redefinition or deletion if necessary.
      }
    });
  }
};
