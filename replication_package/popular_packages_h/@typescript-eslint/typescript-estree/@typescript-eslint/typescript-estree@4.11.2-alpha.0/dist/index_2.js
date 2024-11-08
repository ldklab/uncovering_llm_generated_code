"use strict";

const { simpleTraverse } = require("./simple-traverse");
const { clearCaches } = require("./create-program/createWatchProgram");
const { visitorKeys } = require("@typescript-eslint/visitor-keys");

const parserExports = require("./parser");
const tsEstreeExports = require("./ts-estree");
const packageVersion = require('../package.json').version;

Object.assign(exports, parserExports, tsEstreeExports);

exports.simpleTraverse = simpleTraverse;
exports.clearCaches = clearCaches;
exports.visitorKeys = visitorKeys;
exports.version = packageVersion;
