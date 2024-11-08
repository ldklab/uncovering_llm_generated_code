// Copyright 2013 Lovell Fuller and others.
// SPDX-License-Identifier: Apache-2.0

'use strict';

// Import the base Sharp constructor
const Sharp = require('./constructor');

// Enhance the Sharp object with additional functionalities
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

// Dynamically require each module and pass in the Sharp object
modules.forEach(modulePath => {
  require(modulePath)(Sharp);
});

// Export the fully constructed Sharp module
module.exports = Sharp;
