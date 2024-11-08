// Import the 'function-bind' module, which provides a method to bind a function's context
const functionBind = require('function-bind');

// Check if Function.prototype.bind is not already defined in the environment
if (typeof Function.prototype.bind !== 'function') {
  // If not defined, assign the functionBind module to Function.prototype.bind
  // This allows us to use the bind method to set a function's this context
  Function.prototype.bind = functionBind;
}
