"use strict";

const { default: defaultLoader } = require("./index");
const { defaultGetLocalIdent } = require("./utils");

module.exports = defaultLoader;
module.exports.defaultGetLocalIdent = defaultGetLocalIdent;
