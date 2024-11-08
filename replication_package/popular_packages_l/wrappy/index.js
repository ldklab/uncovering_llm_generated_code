// wrappy.js
function wrappy(wrapperFn) {
  // Return a function that wraps the provided function 'fn'
  return function(fn) {
    // Create the 'wrapped' function by passing 'fn' through 'wrapperFn'
    var wrapped = wrapperFn(fn);

    // Copy properties from 'fn' to 'wrapped'
    Object.keys(fn).forEach(function(prop) {
      wrapped[prop] = fn[prop];
    });

    return wrapped;
  };
}

module.exports = wrappy;

// Example usage:

// Require wrappy function from the module
var wrappy = require("./wrappy");

// Use wrappy to create `once`, a function that wraps a callback and ensures it is called only once
var once = wrappy(function (cb) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    return cb.apply(this, arguments);
  };
});

// Example callback function
function printBoo() {
  console.log('boo');
}

// Add a custom property to the function
printBoo.iAmBooPrinter = true;

// Wrap the function with `once`
var onlyPrintOnce = once(printBoo);

onlyPrintOnce(); // Expected output: 'boo'
onlyPrintOnce(); // Nothing happens

// Verify that properties are retained
console.assert(onlyPrintOnce.iAmBooPrinter === true, "Property not retained");
