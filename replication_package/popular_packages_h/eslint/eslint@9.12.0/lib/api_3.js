/**
 * @fileoverview Provides an interface to require ESLint and its CLI.
 * @autor Ian Christian Myers
 */

"use strict";

// Import necessary ESLint modules
const { ESLint, shouldUseFlatConfig } = require("./eslint/eslint");
const { LegacyESLint } = require("./eslint/legacy-eslint");
const { Linter } = require("./linter");
const { RuleTester } = require("./rule-tester");
const { SourceCode } = require("./languages/js/source-code");

/**
 * Determines which ESLint construct to load based on options.
 * @param {Object} [options={}] Optional configuration settings.
 * @param {boolean} [options.useFlatConfig] Flag to decide configuration style.
 * @returns {Promise<ESLint|LegacyESLint>} The appropriate ESLint constructor.
 */
async function loadESLint({ useFlatConfig } = {}) {
    const shouldUseFlat = useFlatConfig ?? (await shouldUseFlatConfig());
    return shouldUseFlat ? ESLint : LegacyESLint;
}

// Module exports
module.exports = {
    Linter,
    loadESLint,
    ESLint,
    RuleTester,
    SourceCode
};
