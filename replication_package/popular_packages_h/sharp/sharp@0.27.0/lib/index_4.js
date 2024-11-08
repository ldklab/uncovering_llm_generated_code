'use strict';

const Sharp = require('./constructor');

// Augment Sharp with additional functionality
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

modules.forEach(module => {
  require(module)(Sharp);
});

module.exports = Sharp;
