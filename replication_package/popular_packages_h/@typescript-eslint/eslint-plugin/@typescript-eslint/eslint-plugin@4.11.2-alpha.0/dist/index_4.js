"use strict";

const rules = require("./rules");
const all = require("./configs/all");
const base = require("./configs/base");
const recommended = require("./configs/recommended");
const recommendedRequiringTypeChecking = require("./configs/recommended-requiring-type-checking");
const eslintRecommended = require("./configs/eslint-recommended");

module.exports = {
    rules: rules,
    configs: {
        all: all,
        base: base,
        recommended: recommended,
        'eslint-recommended': eslintRecommended,
        'recommended-requiring-type-checking': recommendedRequiringTypeChecking,
    },
};
