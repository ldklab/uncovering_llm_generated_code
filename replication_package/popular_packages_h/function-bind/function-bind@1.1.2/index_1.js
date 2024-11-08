'use strict';

const bindImplementation = require('./implementation');

module.exports = Function.prototype.bind || bindImplementation;
