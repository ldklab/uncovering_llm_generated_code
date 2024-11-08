"use strict";
const importDefault = (module) => module && module.__esModule ? module : { "default": module };

const rules = importDefault(require("./rules")).default;
const allConfig = importDefault(require("./configs/all")).default;
const baseConfig = importDefault(require("./configs/base")).default;
const recommendedConfig = importDefault(require("./configs/recommended")).default;
const typeCheckingConfig = importDefault(require("./configs/recommended-requiring-type-checking")).default;
const eslintRecommendedConfig = importDefault(require("./configs/eslint-recommended")).default;

module.exports = {
    rules: rules,
    configs: {
        all: allConfig,
        base: baseConfig,
        recommended: recommendedConfig,
        'eslint-recommended': eslintRecommendedConfig,
        'recommended-requiring-type-checking': typeCheckingConfig,
    },
};
