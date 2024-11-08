'use strict';

var callFunction = Function.prototype.call;
var hasOwnMethod = Object.prototype.hasOwnProperty;
var functionBind = require('function-bind');

module.exports = functionBind.call(callFunction, hasOwnMethod);
