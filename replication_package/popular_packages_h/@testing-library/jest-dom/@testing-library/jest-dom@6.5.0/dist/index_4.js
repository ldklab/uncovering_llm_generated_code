'use strict';

// Import custom matching functions and various dependencies for testing purposes
const matchers = require('./matchers-4fe91ec3.js');

// Import additional utility libraries that may be used by custom matchers
require('redent');
require('@adobe/css-tools');
require('dom-accessibility-api');
require('aria-query');
require('chalk');
require('lodash/isEqualWith.js');
require('css.escape');

// Extend Jest's testing capabilities by applying custom matchers
expect.extend(matchers.extensions);
