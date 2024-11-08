"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// Import and re-export match path functions from the synchronous match path module
var matchPathSync = require("./match-path-sync");
exports.createMatchPath = matchPathSync.createMatchPath;
exports.matchFromAbsolutePaths = matchPathSync.matchFromAbsolutePaths;

// Import and re-export match path functions from the asynchronous match path module
var matchPathAsync = require("./match-path-async");
exports.createMatchPathAsync = matchPathAsync.createMatchPathAsync;
exports.matchFromAbsolutePathsAsync = matchPathAsync.matchFromAbsolutePathsAsync;

// Import and re-export the register function
var register = require("./register");
exports.register = register.register;

// Import and re-export the configuration loader function
var configLoader = require("./config-loader");
exports.loadConfig = configLoader.loadConfig;
