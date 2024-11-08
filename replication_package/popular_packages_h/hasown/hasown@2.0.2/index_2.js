'use strict';

var bind = require('function-bind');

// Store Object.prototype.hasOwnProperty for later use
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Bind call method to hasOwnProperty, creating a standalone method
var boundHasOwnProperty = bind.call(Function.prototype.call, hasOwnProperty);

// Export the bound method for checking object properties
module.exports = boundHasOwnProperty;
