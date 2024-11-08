"use strict";

// Import local modules/functions
const isUrlRequest = require("./isUrlRequest");
const urlToRequest = require("./urlToRequest");
const getHashDigest = require("./getHashDigest");
const interpolateName = require("./interpolateName");

// Export the imported modules/functions
module.exports = {
  isUrlRequest,
  urlToRequest,
  getHashDigest,
  interpolateName
};
