// wrappy.js
function wrappy(wrapperFunction) {
  // Returns a new function that wraps the provided 'fn'
  return function(originalFunction) {
    // Apply the wrapper function to 'originalFunction', creating 'wrappedFunction'
    var wrappedFunction = wrapperFunction(originalFunction);

    // Copy all original properties from 'originalFunction' to 'wrappedFunction'
    Object.keys(originalFunction).forEach(function(property) {
      wrappedFunction[property] = originalFunction[property];
    });

    // Return the newly wrapped function
    return wrappedFunction;
  };
}

// Export the wrappy function as a module
module.exports = wrappy;

// Example usage:

// Import the wrappy function from the module
var wrappy = require("./wrappy");

// Use wrappy to create a 'once' function that ensures a callback is invoked only once
var once = wrappy(function(callback) {
  var hasBeenCalled = false;
  return function() {
    if (hasBeenCalled) return;
    hasBeenCalled = true;
    return callback.apply(this, arguments);
  };
});

// Define an example function
function printBoo() {
  console.log('boo');
}

// Assign a custom property to the printBoo function
printBoo.iAmBooPrinter = true;

// Wrap 'printBoo' with the 'once' function
var onlyPrintOnce = once(printBoo);

// Invoke the wrapped function - 'boo' should be logged
onlyPrintOnce(); // Output: 'boo'

// Attempt to invoke the wrapped function again - nothing should happen
onlyPrintOnce(); // No output

// Verify that custom properties are copied over
console.assert(onlyPrintOnce.iAmBooPrinter === true, "Property not retained");
