/**
 * @fileoverview Expose ESLint components and CLI for external use.
 * @author 
 */

"use strict";

// Destructuring to import necessary components from respective modules
const { CLIEngine } = require("./cli-engine");
const { ESLint } = require("./eslint");
const { Linter } = require("./linter");
const { RuleTester } = require("./rule-tester");
const { SourceCode } = require("./source-code");

// Exporting destructured components for external access
module.exports = {
    Linter,
    CLIEngine,
    ESLint,
    RuleTester,
    SourceCode
};

// Place a placeholder for a deprecated linter instance
let deprecatedLinterInstance = null;

// Define a non-enumerable deprecated API access to 'linter'
Object.defineProperty(module.exports, "linter", {
    enumerable: false, // This property is not part of standard enumeration
    get() {
        // Lazy initialization of the deprecated linter instance
        if (!deprecatedLinterInstance) {
            deprecatedLinterInstance = new Linter();
        }
        return deprecatedLinterInstance;
    }
});
