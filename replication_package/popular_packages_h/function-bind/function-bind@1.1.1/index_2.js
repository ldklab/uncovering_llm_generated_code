'use strict';

const customBindImplementation = require('./implementation');

// Export the native bind method if available, otherwise fallback to custom implementation
module.exports = Function.prototype.bind ? Function.prototype.bind : customBindImplementation;
