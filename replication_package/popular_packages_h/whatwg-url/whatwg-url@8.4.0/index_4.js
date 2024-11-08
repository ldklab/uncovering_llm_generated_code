"use strict";

const { URL, URLSearchParams } = require("./webidl2js-wrapper");
const urlStateMachine = require("./dist/url-state-machine");
const percentEncoding = require("./dist/percent-encoding");

// Create an object to mimic the global Window object used in browser environments
const browserLikeGlobalObject = {};

// Install URL and URLSearchParams into the global object
URL.install(browserLikeGlobalObject, ["Window"]);
URLSearchParams.install(browserLikeGlobalObject, ["Window"]);

// Export the URL and URLSearchParams objects from the shared global environment
exports.URL = browserLikeGlobalObject.URL;
exports.URLSearchParams = browserLikeGlobalObject.URLSearchParams;

// Export various state machine functions for parsing and handling URLs
exports.parseURL = urlStateMachine.parseURL;
exports.basicURLParse = urlStateMachine.basicURLParse;
exports.serializeURL = urlStateMachine.serializeURL;
exports.serializeHost = urlStateMachine.serializeHost;
exports.serializeInteger = urlStateMachine.serializeInteger;
exports.serializeURLOrigin = urlStateMachine.serializeURLOrigin;
exports.setTheUsername = urlStateMachine.setTheUsername;
exports.setThePassword = urlStateMachine.setThePassword;
exports.cannotHaveAUsernamePasswordPort = urlStateMachine.cannotHaveAUsernamePasswordPort;

// Export percent decoding function
exports.percentDecode = percentEncoding.percentDecodeBytes;
