'use strict';

const Sharp = require('./constructor');

// Extend Sharp with various functionalities
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

modules.forEach(modulePath => {
  require(modulePath)(Sharp);
});

module.exports = Sharp;
