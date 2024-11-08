"use strict";

const { TsJestTransformer } = require("./legacy/ts-jest-transformer");

// Re-exporting modules to make their exports available in this module
module.exports = {
    ...require("./config"),
    ...require("./constants"),
    ...require("./legacy/compiler"),
    ...require("./legacy/ts-jest-transformer"),
    ...require("./legacy/config/config-set"),
    ...require("./presets/create-jest-preset"),
    ...require("./raw-compiler-options"),
    ...require("./utils"),
    ...require("./types"),

    // Default export: providing a method to create a transformer
    default: {
        createTransformer(tsJestConfig) {
            return new TsJestTransformer(tsJestConfig);
        },
    }
};
