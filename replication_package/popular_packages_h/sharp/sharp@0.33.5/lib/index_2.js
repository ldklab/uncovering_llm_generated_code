// Copyright 2013 Lovell Fuller and others.
// SPDX-License-Identifier: Apache-2.0

'use strict';

// Import the main Sharp constructor or class
const Sharp = require('./constructor');

// Extend the Sharp object with additional functionalities
[
  './input',
  './resize',
  './composite',
  './operation',
  './colour',
  './channel',
  './output',
  './utility'
].forEach(extension => require(extension)(Sharp));

// Export the configured Sharp object as the module
module.exports = Sharp;
