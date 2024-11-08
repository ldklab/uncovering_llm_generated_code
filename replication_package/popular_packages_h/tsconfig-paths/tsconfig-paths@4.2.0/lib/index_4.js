"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

// Exporting functions from match-path-sync module
const { createMatchPath, matchFromAbsolutePaths } = require("./match-path-sync");
exports.createMatchPath = createMatchPath;
exports.matchFromAbsolutePaths = matchFromAbsolutePaths;

// Exporting functions from match-path-async module
const { createMatchPathAsync, matchFromAbsolutePathsAsync } = require("./match-path-async");
exports.createMatchPathAsync = createMatchPathAsync;
exports.matchFromAbsolutePathsAsync = matchFromAbsolutePathsAsync;

// Exporting register from register module
const { register } = require("./register");
exports.register = register;

// Exporting loadConfig from config-loader module
const { loadConfig } = require("./config-loader");
exports.loadConfig = loadConfig;
