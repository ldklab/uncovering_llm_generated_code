"use strict";

// Import the specific functions from the `parser` and `@typescript-eslint/typescript-estree` modules.
var parser = require("./parser");
var typescriptEstree = require("@typescript-eslint/typescript-estree");

// Export the `parse` and `parseForESLint` functions from the `parser` module.
exports.parse = parser.parse;
exports.parseForESLint = parser.parseForESLint;

// Export the `clearCaches` function from the `@typescript-eslint/typescript-estree` module.
exports.clearCaches = typescriptEstree.clearCaches;

// Directly access the `version` from the `package.json`. This is done without importing to prevent `tsc` from copying `package.json` to the distribution folder.
exports.version = require('../package.json').version;
