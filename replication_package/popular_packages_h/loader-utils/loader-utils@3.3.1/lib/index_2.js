"use strict";

// Import required modules
const isUrlRequest = require("./isUrlRequest");
const urlToRequest = require("./urlToRequest");
const getHashDigest = require("./getHashDigest");
const interpolateName = require("./interpolateName");

// Export the imported modules for external use
module.exports = {
  urlToRequest,
  getHashDigest,
  interpolateName,
  isUrlRequest
};
