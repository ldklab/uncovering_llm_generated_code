"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { simpleTraverse } = require("./simple-traverse");
const { clearCaches } = require("./create-program/createWatchProgram");
const { visitorKeys } = require("@typescript-eslint/visitor-keys");
const packageJson = require('../package.json');

// Re-export everything from the specified modules for a combined API
module.exports = {
  ...require("./parser"),
  ...require("./ts-estree"),
  
  // Direct exports to provide specific functionalities
  simpleTraverse,
  clearCaches,
  
  // Ensure backwards compatibility with specific exports
  visitorKeys,
  
  // Exporting package version
  version: packageJson.version
};
