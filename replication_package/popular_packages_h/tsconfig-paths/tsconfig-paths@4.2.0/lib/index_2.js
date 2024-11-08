"use strict";

// Export necessary functions from their respective modules for use in other parts of the application

// Import and re-export synchronous path matching functions
const { createMatchPath, matchFromAbsolutePaths } = require("./match-path-sync");
exports.createMatchPath = createMatchPath;
exports.matchFromAbsolutePaths = matchFromAbsolutePaths;

// Import and re-export asynchronous path matching functions
const { createMatchPathAsync, matchFromAbsolutePathsAsync } = require("./match-path-async");
exports.createMatchPathAsync = createMatchPathAsync;
exports.matchFromAbsolutePathsAsync = matchFromAbsolutePathsAsync;

// Import and re-export the register function
const { register } = require("./register");
exports.register = register;

// Import and re-export the loadConfig function
const { loadConfig } = require("./config-loader");
exports.loadConfig = loadConfig;

//# sourceMappingURL=index.js.map
