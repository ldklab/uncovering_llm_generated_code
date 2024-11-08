"use strict";

// Importing necessary modules for URL wrapping and utilities
const { URL, URLSearchParams } = require("./webidl2js-wrapper");
const urlStateMachine = require("./dist/url-state-machine");
const percentEncoding = require("./dist/percent-encoding");

// Creating a shared global object for the wrapped classes
const sharedGlobalObject = {};

// Installing URL and URLSearchParams in the shared global object under the "Window"
URL.install(sharedGlobalObject, ["Window"]);
URLSearchParams.install(sharedGlobalObject, ["Window"]);

// Exporting the URL and URLSearchParams classes
exports.URL = sharedGlobalObject.URL;
exports.URLSearchParams = sharedGlobalObject.URLSearchParams;

// Exporting functions from the URL state machine for parsing and serialization
exports.parseURL = urlStateMachine.parseURL;
exports.basicURLParse = urlStateMachine.basicURLParse;
exports.serializeURL = urlStateMachine.serializeURL;
exports.serializeHost = urlStateMachine.serializeHost;
exports.serializeInteger = urlStateMachine.serializeInteger;
exports.serializeURLOrigin = urlStateMachine.serializeURLOrigin;
exports.setTheUsername = urlStateMachine.setTheUsername;
exports.setThePassword = urlStateMachine.setThePassword;
exports.cannotHaveAUsernamePasswordPort = urlStateMachine.cannotHaveAUsernamePasswordPort;

// Exporting the percentDecode function for decoding percent-encoded bytes
exports.percentDecode = percentEncoding.percentDecodeBytes;
