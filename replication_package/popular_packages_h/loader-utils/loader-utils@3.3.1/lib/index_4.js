"use strict";

// Import utility functions
const isUrlRequest = require("./isUrlRequest");
const urlToRequest = require("./urlToRequest");
const getHashDigest = require("./getHashDigest");
const interpolateName = require("./interpolateName");

// Export the utility functions for external use
module.exports = {
  isUrlRequest,
  urlToRequest,
  getHashDigest,
  interpolateName,
};
