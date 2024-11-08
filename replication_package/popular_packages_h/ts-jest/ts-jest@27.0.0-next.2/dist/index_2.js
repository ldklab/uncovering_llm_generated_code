"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

// Importing the TsJestTransformer class from a local module.
const { TsJestTransformer } = require('./ts-jest-transformer');

// Factory function to create and return a new TsJestTransformer instance.
function createTransformer() {
    return new TsJestTransformer();
}

// Exporting the createTransformer function.
exports.createTransformer = createTransformer;
