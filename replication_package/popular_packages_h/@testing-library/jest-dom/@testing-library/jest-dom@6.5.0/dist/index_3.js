'use strict';

// Import the custom matchers module and other dependencies
var matchers = require('./matchers-4fe91ec3.js');
require('redent');
require('@adobe/css-tools');
require('dom-accessibility-api');
require('aria-query');
require('chalk');
require('lodash/isEqualWith.js');
require('css.escape');

// Extend the `expect` assertion library with custom matchers
expect.extend(matchers.extensions);
