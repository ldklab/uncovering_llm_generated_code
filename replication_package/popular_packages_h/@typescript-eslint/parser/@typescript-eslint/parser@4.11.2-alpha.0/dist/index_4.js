"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// Import functions from the local parser module
const parser = require("./parser");
exports.parse = parser.parse;
exports.parseForESLint = parser.parseForESLint;

// Import and re-export clearCaches from @typescript-eslint/typescript-estree
const { clearCaches } = require("@typescript-eslint/typescript-estree");
exports.clearCaches = clearCaches;

// Retrieve and export version from package.json
const packageJson = require('../package.json');
exports.version = packageJson.version;
