'use strict';

// Export modules using CommonJS syntax
exports.ast = require('./ast');
exports.code = require('./code');
exports.keyword = require('./keyword');

/**
 * This module provides access to 'ast', 'code', and 'keyword' by
 * requiring their respective files. It is designed to be used as a 
 * part of a Node.js application or library where these modules are 
 * needed. The use of 'use strict' directive ensures stricter parsing 
 * and error handling.
 */
