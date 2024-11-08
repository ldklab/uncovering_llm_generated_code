"use strict";

const { parse, parseForESLint } = require("./parser");
const { clearCaches } = require("@typescript-eslint/typescript-estree");
const version = require('../package.json').version;

module.exports = {
    parse,
    parseForESLint,
    clearCaches,
    version
};
