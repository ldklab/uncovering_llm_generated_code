"use strict";

const { URL, URLSearchParams } = require("./webidl2js-wrapper");
const urlStateMachine = require("./lib/url-state-machine");
const percentEncoding = require("./lib/percent-encoding");

// Set up a shared global object with specified global constructors for installation
const sharedGlobalObject = { Array, Object, Promise, String, TypeError };

// Install URL and URLSearchParams on the shared global object
URL.install(sharedGlobalObject, ["Window"]);
URLSearchParams.install(sharedGlobalObject, ["Window"]);

// Export the installed URL components
exports.URL = sharedGlobalObject.URL;
exports.URLSearchParams = sharedGlobalObject.URLSearchParams;

// Re-export functions from the urlStateMachine module for URL handling
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

// Re-export functions from the percentEncoding module for decoding
exports.percentDecodeString = percentEncoding.percentDecodeString;
exports.percentDecodeBytes = percentEncoding.percentDecodeBytes;
