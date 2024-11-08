// Import the 'function-bind' module to provide a polyfill for Function.prototype.bind
const functionBind = require('function-bind');

// Assign the polyfilled bind method to Function.prototype.bind
Function.prototype.bind = functionBind;

// Now, Function.prototype.bind is ensured to be available and consistent across environments.
