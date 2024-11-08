/**
 * @fileoverview Expose out ESLint and CLI to require.
 * @author 
 */

"use strict";

// Import components from respective files
const { CLIEngine } = require("./cli-engine");
const { ESLint } = require("./eslint");
const { Linter } = require("./linter");
const { RuleTester } = require("./rule-tester");
const { SourceCode } = require("./source-code");

// Export modules
module.exports = {
    Linter,
    CLIEngine,
    ESLint,
    RuleTester,
    SourceCode
};

// Handle deprecated Linter API
let cachedLinter = null;

Object.defineProperty(module.exports, "linter", {
    enumerable: false,
    get() {
        if (!cachedLinter) {
            cachedLinter = new Linter();
        }
        return cachedLinter;
    }
});
