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

const sharedGlobalObject = { Array, Object, Promise, String, TypeError };

URL.install(sharedGlobalObject, ["Window"]);
URLSearchParams.install(sharedGlobalObject, ["Window"]);

exports.URL = sharedGlobalObject.URL;
exports.URLSearchParams = sharedGlobalObject.URLSearchParams;

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

exports.percentDecodeString = percentDecodeString;
exports.percentDecodeBytes = percentDecodeBytes;
