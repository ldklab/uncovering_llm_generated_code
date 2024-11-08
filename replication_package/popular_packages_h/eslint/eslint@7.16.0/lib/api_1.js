"use strict";

const { CLIEngine } = require("./cli-engine");
const { ESLint } = require("./eslint");
const { Linter } = require("./linter");
const { RuleTester } = require("./rule-tester");
const { SourceCode } = require("./source-code");

module.exports = {
  Linter,
  CLIEngine,
  ESLint,
  RuleTester,
  SourceCode
};

// Deprecated Linter instance (Lazy instantiation)
let deprecatedLinter = null;

Object.defineProperty(module.exports, "linter", {
  enumerable: false,
  get() {
    if (!deprecatedLinter) {
      deprecatedLinter = new Linter();
    }
    return deprecatedLinter;
  }
});
