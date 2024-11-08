"use strict";

// Import necessary modules and functions
const { ESLint, shouldUseFlatConfig } = require("./eslint/eslint");
const { LegacyESLint } = require("./eslint/legacy-eslint");
const { Linter } = require("./linter");
const { RuleTester } = require("./rule-tester");
const { SourceCode } = require("./languages/js/source-code");

/**
 * Selects the correct ESLint class based on configuration options.
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.useFlatConfig] - Determines if flat config is used
 * @returns {Promise<ESLint|LegacyESLint>} Appropriate ESLint constructor
 */
async function loadESLint({ useFlatConfig } = {}) {
    const configChoice = useFlatConfig ?? (await shouldUseFlatConfig());
    return configChoice ? ESLint : LegacyESLint;
}

// Export modules and functions
module.exports = {
    Linter,
    loadESLint,
    ESLint,
    RuleTester,
    SourceCode
};
