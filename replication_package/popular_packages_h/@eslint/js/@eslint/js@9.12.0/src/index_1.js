/**
 * @fileoverview Main package entrypoint.
 * @author Nicholas C.
 */

"use strict";

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

const eslintAllConfig = require("./configs/eslint-all");
const eslintRecommendedConfig = require("./configs/eslint-recommended");

module.exports = {
    configs: {
        all: eslintAllConfig,
        recommended: eslintRecommendedConfig
    }
};
