'use strict';

const Sharp = require('./constructor');

// Extend Sharp with functionality from various modules
const modules = [
  './input',
  './resize',
  './composite',
  './operation',
  './colour',
  './channel',
  './output',
  './utility'
];

// Dynamically require and apply each module to Sharp
modules.forEach(modulePath => {
  require(modulePath)(Sharp);
});

module.exports = Sharp;
