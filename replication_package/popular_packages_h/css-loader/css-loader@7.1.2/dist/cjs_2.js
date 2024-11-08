"use strict";

// Import the default export from the 'index' module
const loader = require("./index");

// Set the default export of the current module to the imported loader's default export
module.exports = loader.default;

// Import 'defaultGetLocalIdent' from 'utils' and attach it to the current module exports
const { defaultGetLocalIdent } = require("./utils");
module.exports.defaultGetLocalIdent = defaultGetLocalIdent;
