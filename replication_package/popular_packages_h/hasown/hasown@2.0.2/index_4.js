'use strict';

const callMethod = Function.prototype.call;
const objectHasOwnProperty = Object.prototype.hasOwnProperty;
const bind = require('function-bind');

// Export a bound version of the hasOwnProperty function
module.exports = bind.call(callMethod, objectHasOwnProperty);
