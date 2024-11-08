/**
 * @fileoverview Main package entrypoint.
 * @author Nicholas C.
 */

"use strict";

// Exporting available ESLint configurations
module.exports = {
    // Configuration presets
    configs: {
        // Complete set of ESLint rules
        all: require("./configs/eslint-all"),
        // Recommended ESLint rules for most projects
        recommended: require("./configs/eslint-recommended")
    }
};
