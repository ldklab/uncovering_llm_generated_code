"use strict";

const { TsJestTransformer } = require("./legacy/ts-jest-transformer");

Object.defineProperty(exports, "__esModule", { value: true });

const exportModules = [
    "./config",
    "./constants",
    "./legacy/compiler",
    "./legacy/ts-jest-transformer",
    "./legacy/config/config-set",
    "./presets/create-jest-preset",
    "./raw-compiler-options",
    "./utils",
    "./types"
];

exportModules.forEach(modulePath => {
    const moduleExports = require(modulePath);
    Object.keys(moduleExports).forEach(key => {
        if (key !== "default" && !Object.prototype.hasOwnProperty.call(exports, key)) {
            exports[key] = moduleExports[key];
        }
    });
});

exports.default = {
    createTransformer: function (tsJestConfig) {
        return new TsJestTransformer(tsJestConfig);
    },
};
