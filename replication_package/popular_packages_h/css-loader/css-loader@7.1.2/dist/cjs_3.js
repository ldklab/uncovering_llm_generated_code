"use strict";

// Importing the loader module from the local index.js file
const loader = require("./index");

// Re-exporting the default export of the loader module
module.exports = loader.default;

// Importing the defaultGetLocalIdent from the local utils.js file
const { defaultGetLocalIdent } = require("./utils");

// Re-exporting the defaultGetLocalIdent function
module.exports.defaultGetLocalIdent = defaultGetLocalIdent;
