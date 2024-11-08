"use strict";

// Export synchronous path matching functions
const { createMatchPath, matchFromAbsolutePaths } = require("./match-path-sync");
exports.createMatchPath = createMatchPath;
exports.matchFromAbsolutePaths = matchFromAbsolutePaths;

// Export asynchronous path matching functions
const { createMatchPathAsync, matchFromAbsolutePathsAsync } = require("./match-path-async");
exports.createMatchPathAsync = createMatchPathAsync;
exports.matchFromAbsolutePathsAsync = matchFromAbsolutePathsAsync;

// Export register function
const { register } = require("./register");
exports.register = register;

// Export config loader function
const { loadConfig } = require("./config-loader");
exports.loadConfig = loadConfig;

//# sourceMappingURL=index.js.map
