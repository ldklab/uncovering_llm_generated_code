"use strict";

const isUrlRequest = require("./isUrlRequest");
const urlToRequest = require("./urlToRequest");
const getHashDigest = require("./getHashDigest");
const interpolateName = require("./interpolateName");

module.exports = {
    isUrlRequest,
    urlToRequest,
    getHashDigest,
    interpolateName,
};
