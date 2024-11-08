"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { TsJestTransformer } = require("./ts-jest-transformer");

function createTransformer() {
    return new TsJestTransformer();
}

exports.createTransformer = createTransformer;
