/**
 * @fileoverview Provides access to ESLint and its components for requiring in Node.js.
 * @author
 */

"use strict";

// Import key modules from ESLint tool.
const { CLIEngine } = require("./cli-engine");
const { ESLint } = require("./eslint");
const { Linter } = require("./linter");
const { RuleTester } = require("./rule-tester");
const { SourceCode } = require("./source-code");

// Export the modules for external use.
module.exports = {
    Linter,
    CLIEngine,
    ESLint,
    RuleTester,
    SourceCode
};

// Prepare for deprecation: Instance for deprecated "linter" property.
let legacyLinterInstance = null;

// Define the deprecated "linter" property that initializes a Linter instance lazily.
Object.defineProperty(module.exports, "linter", {
    enumerable: false,
    get() {
        if (!legacyLinterInstance) {
            legacyLinterInstance = new Linter();
        }
        return legacyLinterInstance;
    }
});
