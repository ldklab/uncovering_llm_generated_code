"use strict";

const { TsJestTransformer } = require("./legacy/ts-jest-transformer");
const config = require("./config");
const constants = require("./constants");
const compiler = require("./legacy/compiler");
const tsJestTransformer = require("./legacy/ts-jest-transformer");
const configSet = require("./legacy/config/config-set");
const createJestPreset = require("./presets/create-jest-preset");
const rawCompilerOptions = require("./raw-compiler-options");
const utils = require("./utils");
const types = require("./types");

module.exports = {
    ...config,
    ...constants,
    ...compiler,
    ...tsJestTransformer,
    ...configSet,
    ...createJestPreset,
    ...rawCompilerOptions,
    ...utils,
    ...types,
    default: {
        createTransformer: function (tsJestConfig) {
            return new TsJestTransformer(tsJestConfig);
        },
    },
};
