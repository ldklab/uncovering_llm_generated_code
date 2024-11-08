"use strict";

const { URL, URLSearchParams } = require("./webidl2js-wrapper");
const {
  parseURL,
  basicURLParse,
  serializeURL,
  serializePath,
  serializeHost,
  serializeInteger,
  serializeURLOrigin,
  setTheUsername,
  setThePassword,
  cannotHaveAUsernamePasswordPort,
  hasAnOpaquePath
} = require("./lib/url-state-machine");
const {
  percentDecodeString,
  percentDecodeBytes
} = require("./lib/percent-encoding");

// Initialize a shared global object with JavaScript constructors
const sharedGlobalObject = {
  Array,
  Object,
  Promise,
  String,
  TypeError
};

// Install URL and URLSearchParams into the shared global object for the "Window" environment
URL.install(sharedGlobalObject, ["Window"]);
URLSearchParams.install(sharedGlobalObject, ["Window"]);

// Export the URL and URLSearchParams classes
exports.URL = sharedGlobalObject.URL;
exports.URLSearchParams = sharedGlobalObject.URLSearchParams;

// Export URL handling functions
exports.parseURL = parseURL;
exports.basicURLParse = basicURLParse;
exports.serializeURL = serializeURL;
exports.serializePath = serializePath;
exports.serializeHost = serializeHost;
exports.serializeInteger = serializeInteger;
exports.serializeURLOrigin = serializeURLOrigin;
exports.setTheUsername = setTheUsername;
exports.setThePassword = setThePassword;
exports.cannotHaveAUsernamePasswordPort = cannotHaveAUsernamePasswordPort;
exports.hasAnOpaquePath = hasAnOpaquePath;

// Export percent-encoding functions
exports.percentDecodeString = percentDecodeString;
exports.percentDecodeBytes = percentDecodeBytes;
