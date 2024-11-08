// Require the 'function-bind' module
const functionBind = require("function-bind");

// Assign it to the Function prototype's bind method
Function.prototype.bind = functionBind;
