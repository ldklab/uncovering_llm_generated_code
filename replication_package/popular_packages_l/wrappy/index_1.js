// wrapper.js
function wrapFunction(wrapperFunc) {
  return function(targetFunc) {
    const wrappedFunc = wrapperFunc(targetFunc);

    Object.keys(targetFunc).forEach((key) => {
      wrappedFunc[key] = targetFunc[key];
    });

    return wrappedFunc;
  };
}

module.exports = wrapFunction;

// Sample usage:

// Import the wrapFunction method
const wrapFunction = require('./wrapper');

// Create a `once` function to ensure a callback executes only a single time
const once = wrapFunction(function(callback) {
  let isCalled = false;
  return function() {
    if (isCalled) return;
    isCalled = true;
    return callback.apply(this, arguments);
  };
});

// Example callback function
function showBoo() {
  console.log('boo');
}

// Attach a custom property to the function
showBoo.isBooPrinter = true;

// Use the `once` wrapper
const printOnlyOnce = once(showBoo);

printOnlyOnce(); // Expected output: 'boo'
printOnlyOnce(); // No output expected

// Check the retention of properties
console.assert(printOnlyOnce.isBooPrinter === true, "Property not retained");
