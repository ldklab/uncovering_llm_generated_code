"use strict";

// Import and re-export functions from match-path-sync module
const { createMatchPath, matchFromAbsolutePaths } = require("./match-path-sync");
exports.createMatchPath = createMatchPath;
exports.matchFromAbsolutePaths = matchFromAbsolutePaths;

// Import and re-export functions from match-path-async module
const { createMatchPathAsync, matchFromAbsolutePathsAsync } = require("./match-path-async");
exports.createMatchPathAsync = createMatchPathAsync;
exports.matchFromAbsolutePathsAsync = matchFromAbsolutePathsAsync;

// Import and re-export the register function from the register module
const { register } = require("./register");
exports.register = register;

// Import and re-export the loadConfig function from the config-loader module
const { loadConfig } = require("./config-loader");
exports.loadConfig = loadConfig;
