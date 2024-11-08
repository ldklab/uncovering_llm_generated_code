'use strict';

const implementation = require('./implementation');

module.exports = typeof Function.prototype.bind === 'function' 
  ? Function.prototype.bind 
  : implementation;
