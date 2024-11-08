'use strict';

const bind = require('function-bind');

// Create a reference to the hasOwnProperty method of the Object prototype
const hasOwnProperty = Object.prototype.hasOwnProperty;

// Bind the call function to hasOwnProperty, allowing use as a standalone utility
module.exports = bind.call(Function.prototype.call, hasOwnProperty);
