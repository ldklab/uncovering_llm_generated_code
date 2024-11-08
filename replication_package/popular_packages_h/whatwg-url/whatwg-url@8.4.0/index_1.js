"use strict";

const { URL, URLSearchParams } = require("./webidl2js-wrapper");
const urlStateMachine = require("./dist/url-state-machine");
const percentEncoding = require("./dist/percent-encoding");

// Create a global object to hold URL and URLSearchParams for a Window-like environment
const sharedGlobalObject = {};
URL.install(sharedGlobalObject, ["Window"]);
URLSearchParams.install(sharedGlobalObject, ["Window"]);

// Export URL and URLSearchParams from the shared global object
exports.URL = sharedGlobalObject.URL;
exports.URLSearchParams = sharedGlobalObject.URLSearchParams;

// Export functions related to URL parsing and serialization from the URL state machine
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
