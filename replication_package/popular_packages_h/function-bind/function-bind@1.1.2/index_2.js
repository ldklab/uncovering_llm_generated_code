'use strict';

const customBind = require('./implementation');

module.exports = Function.prototype.bind ?? customBind;
