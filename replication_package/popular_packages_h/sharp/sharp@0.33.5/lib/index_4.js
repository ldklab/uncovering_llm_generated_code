// Copyright 2013 Lovell Fuller and others.
// SPDX-License-Identifier: Apache-2.0

'use strict';

// Import the Sharp constructor
const Sharp = require('./constructor');

// Enhance Sharp with additional functionalities
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

// Export the enhanced Sharp object
module.exports = Sharp;
