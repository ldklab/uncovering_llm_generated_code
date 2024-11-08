"use strict";

const { ESLint, shouldUseFlatConfig } = require("./eslint/eslint");
const { LegacyESLint } = require("./eslint/legacy-eslint");
const { Linter } = require("./linter");
const { RuleTester } = require("./rule-tester");
const { SourceCode } = require("./languages/js/source-code");

async function loadESLint({ useFlatConfig } = {}) {
    const shouldESLintUseFlatConfig = useFlatConfig ?? (await shouldUseFlatConfig());
    return shouldESLintUseFlatConfig ? ESLint : LegacyESLint;
}

module.exports = {
    Linter,
    loadESLint,
    ESLint,
    RuleTester,
    SourceCode
};
