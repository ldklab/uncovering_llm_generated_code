"use strict";

// Importing necessary modules for URL handling and percent encoding
const { URL, URLSearchParams } = require("./webidl2js-wrapper");
const urlStateMachine = require("./dist/url-state-machine");
const percentEncoding = require("./dist/percent-encoding");

// Creating a shared global object to simulate a 'Window' context
const sharedGlobalObject = {};

// Installing URL and URLSearchParams functionalities in the shared global object
URL.install(sharedGlobalObject, ["Window"]);
URLSearchParams.install(sharedGlobalObject, ["Window"]);

// Exporting URL and URLSearchParams from the shared global object
exports.URL = sharedGlobalObject.URL;
exports.URLSearchParams = sharedGlobalObject.URLSearchParams;

// Exporting URL processing functionalities from the URL state machine
exports.parseURL = urlStateMachine.parseURL;
exports.basicURLParse = urlStateMachine.basicURLParse;
exports.serializeURL = urlStateMachine.serializeURL;
exports.serializeHost = urlStateMachine.serializeHost;
exports.serializeInteger = urlStateMachine.serializeInteger;
exports.serializeURLOrigin = urlStateMachine.serializeURLOrigin;
exports.setTheUsername = urlStateMachine.setTheUsername;
exports.setThePassword = urlStateMachine.setThePassword;
exports.cannotHaveAUsernamePasswordPort = urlStateMachine.cannotHaveAUsernamePasswordPort;

// Exporting percent decoding functionality
exports.percentDecode = percentEncoding.percentDecodeBytes;
