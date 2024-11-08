"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const { simpleTraverse } = require("./simple-traverse");
exports.simpleTraverse = simpleTraverse;

const { clearCaches } = require("./create-program/createWatchProgram");
exports.clearCaches = clearCaches;

const { visitorKeys } = require("@typescript-eslint/visitor-keys");
exports.visitorKeys = visitorKeys;

const parser = require("./parser");
Object.assign(exports, parser);

const tsEstree = require("./ts-estree");
Object.assign(exports, tsEstree);

// Export version from package.json
exports.version = require('../package.json').version;
