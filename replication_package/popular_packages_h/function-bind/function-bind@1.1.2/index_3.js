'use strict';

const customBind = require('./implementation');

module.exports = (typeof Function.prototype.bind === 'function') ? Function.prototype.bind : customBind;
