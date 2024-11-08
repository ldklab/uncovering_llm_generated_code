'use strict';

// Import custom matchers
const matchers = require('./matchers-4fe91ec3.js');

// Import additional libraries, potentially for use in matchers
require('redent');
require('@adobe/css-tools');
require('dom-accessibility-api');
require('aria-query');
require('chalk');
require('lodash/isEqualWith.js');
require('css.escape');

// Extend the expect object with custom matchers
expect.extend(matchers.extensions);
