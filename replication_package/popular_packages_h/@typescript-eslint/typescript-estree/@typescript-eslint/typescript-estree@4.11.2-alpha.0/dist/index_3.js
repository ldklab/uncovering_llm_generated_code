"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

// Re-export all from the parser and ts-estree modules
const parser = require("./parser");
Object.assign(exports, parser);

const tsEstree = require("./ts-estree");
Object.assign(exports, tsEstree);

// Import and export simpleTraverse from simple-traverse
const simpleTraverseModule = require("./simple-traverse");
exports.simpleTraverse = simpleTraverseModule.simpleTraverse;

// Import and export clearCaches from createWatchProgram
const createWatchProgram = require("./create-program/createWatchProgram");
exports.clearCaches = createWatchProgram.clearCaches;

// Re-export visitorKeys from @typescript-eslint/visitor-keys for backward compatibility
const visitorKeysModule = require("@typescript-eslint/visitor-keys");
exports.visitorKeys = visitorKeysModule.visitorKeys;

// Export version from package.json
exports.version = require('../package.json').version;
