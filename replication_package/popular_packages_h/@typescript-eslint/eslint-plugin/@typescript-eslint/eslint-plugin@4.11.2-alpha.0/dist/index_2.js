"use strict";

const rules = require("./rules").default;
const allConfig = require("./configs/all").default;
const baseConfig = require("./configs/base").default;
const recommendedConfig = require("./configs/recommended").default;
const recommendedRequiringTypeCheckingConfig = require("./configs/recommended-requiring-type-checking").default;
const eslintRecommendedConfig = require("./configs/eslint-recommended").default;

module.exports = {
    rules: rules,
    configs: {
        all: allConfig,
        base: baseConfig,
        recommended: recommendedConfig,
        'eslint-recommended': eslintRecommendedConfig,
        'recommended-requiring-type-checking': recommendedRequiringTypeCheckingConfig,
    },
};
