/**
 * @fileoverview Expose out ESLint and CLI to require.
 * @author Ian Christian Myers
 */

"use strict";

// Import necessary components from various ESLint modules.
const { ESLint, shouldUseFlatConfig } = require("./eslint/eslint");
const { LegacyESLint } = require("./eslint/legacy-eslint");
const { Linter } = require("./linter");
const { RuleTester } = require("./rule-tester");
const { SourceCode } = require("./languages/js/source-code");

/**
 * Determines the appropriate ESLint constructor to use based on options provided.
 * @param {Object} [options] Configuration object to decide which ESLint version to load.
 * @param {boolean} [options.useFlatConfig] Flag specifying whether to use flat configuration.
 * @returns {Promise<ESLint|LegacyESLint>} Returns a promise resolving to either ESLint or LegacyESLint constructor.
 */
async function loadESLint({ useFlatConfig } = {}) {
    // Determine if ESLint should use flat configurations.
    const shouldESLintUseFlatConfig = useFlatConfig ?? (await shouldUseFlatConfig());

    // Return either the ESLint or LegacyESLint constructor based on the determined configuration.
    return shouldESLintUseFlatConfig ? ESLint : LegacyESLint;
}

// Export the necessary components for external usage.
module.exports = {
    Linter,
    loadESLint,
    ESLint,
    RuleTester,
    SourceCode
};
