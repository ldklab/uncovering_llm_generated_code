"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// Synchronous path matching functions
var { createMatchPath, matchFromAbsolutePaths } = require("./match-path-sync");
exports.createMatchPath = createMatchPath;
exports.matchFromAbsolutePaths = matchFromAbsolutePaths;

// Asynchronous path matching functions
var { createMatchPathAsync, matchFromAbsolutePathsAsync } = require("./match-path-async");
exports.createMatchPathAsync = createMatchPathAsync;
exports.matchFromAbsolutePathsAsync = matchFromAbsolutePathsAsync;

// Registration function
var { register } = require("./register");
exports.register = register;

// Configuration loader
var { loadConfig } = require("./config-loader");
exports.loadConfig = loadConfig;
