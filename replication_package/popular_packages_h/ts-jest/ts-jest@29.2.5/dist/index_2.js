"use strict";

var ts_jest_transformer_1 = require("./legacy/ts-jest-transformer");

const allExports = [
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

// Use a loop to streamline the re-export process
for (const path of allExports) {
  Object.assign(exports, require(path));
}

exports.default = {
  createTransformer(tsJestConfig) {
    return new ts_jest_transformer_1.TsJestTransformer(tsJestConfig);
  }
};
