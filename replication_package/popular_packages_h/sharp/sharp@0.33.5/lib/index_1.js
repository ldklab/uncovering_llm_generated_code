// Copyright 2013 Lovell Fuller and others.
// SPDX-License-Identifier: Apache-2.0

'use strict';

// Import the base Sharp constructor
const Sharp = require('./constructor');

// Enhance Sharp with various functionalities
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

// Require each module and pass the Sharp object for enhancement
modules.forEach(module => require(module)(Sharp));

// Export the fully constructed Sharp module
module.exports = Sharp;
