"use strict";

// Export the parse and parseForESLint functions from the ./parser module
var { parse, parseForESLint } = require('./parser');
exports.parse = parse;
exports.parseForESLint = parseForESLint;

// Export the clearCaches function from the @typescript-eslint/typescript-estree module
var { clearCaches } = require('@typescript-eslint/typescript-estree');
exports.clearCaches = clearCaches;

// Export the version of the application by reading it from the package.json file
exports.version = require('../package.json').version;
