"use strict";

const { URL: WebIDLURL, URLSearchParams: WebIDLURLSearchParams } = require("./webidl2js-wrapper");
const urlStateMachine = require("./lib/url-state-machine");
const percentEncoding = require("./lib/percent-encoding");

// Create an object representing the shared global scope
const sharedGlobalObject = {
  Array,
  Object,
  Promise,
  String,
  TypeError
};

// Install URL and URLSearchParams into the shared global object
WebIDLURL.install(sharedGlobalObject, ["Window"]);
WebIDLURLSearchParams.install(sharedGlobalObject, ["Window"]);

// Export the installed URL and URLSearchParams from the shared global object
exports.URL = sharedGlobalObject.URL;
exports.URLSearchParams = sharedGlobalObject.URLSearchParams;

// Re-export URL state machine parsing and serialization functions
exports.parseURL = urlStateMachine.parseURL;
exports.basicURLParse = urlStateMachine.basicURLParse;
exports.serializeURL = urlStateMachine.serializeURL;
exports.serializePath = urlStateMachine.serializePath;
exports.serializeHost = urlStateMachine.serializeHost;
exports.serializeInteger = urlStateMachine.serializeInteger;
exports.serializeURLOrigin = urlStateMachine.serializeURLOrigin;
exports.setTheUsername = urlStateMachine.setTheUsername;
exports.setThePassword = urlStateMachine.setThePassword;
exports.cannotHaveAUsernamePasswordPort = urlStateMachine.cannotHaveAUsernamePasswordPort;
exports.hasAnOpaquePath = urlStateMachine.hasAnOpaquePath;

// Re-export percent-encoding functions
exports.percentDecodeString = percentEncoding.percentDecodeString;
exports.percentDecodeBytes = percentEncoding.percentDecodeBytes;
