'use strict';

// Import necessary modules
const matchers = require('./matchers-4fe91ec3.js');
require('redent');
require('@adobe/css-tools');
require('dom-accessibility-api');
require('aria-query');
require('chalk');
require('lodash/isEqualWith.js');
require('css.escape');

// Extend Jest expect with custom matchers
expect.extend(matchers.extensions);
