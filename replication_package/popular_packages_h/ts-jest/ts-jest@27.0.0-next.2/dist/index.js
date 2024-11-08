"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransformer = void 0;
var ts_jest_transformer_1 = require("./ts-jest-transformer");
function createTransformer() {
    return new ts_jest_transformer_1.TsJestTransformer();
}
exports.createTransformer = createTransformer;
