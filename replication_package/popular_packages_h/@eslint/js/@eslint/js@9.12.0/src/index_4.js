/**
 * @fileoverview Main package entrypoint.
 * @author
 *   Nicholas C. Zakas
 */

"use strict";

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

const eslintAllConfig = require("./configs/eslint-all");
const eslintRecommendedConfig = require("./configs/eslint-recommended");

const configs = {
    all: eslintAllConfig,
    recommended: eslintRecommendedConfig
};

module.exports = { configs };
