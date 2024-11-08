"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TsJestCompiler = void 0;
var ts_compiler_1 = require("./ts-compiler");
var TsJestCompiler = (function () {
    function TsJestCompiler(configSet, jestCacheFS) {
        this.configSet = configSet;
        this.jestCacheFS = jestCacheFS;
        this._compilerInstance = new ts_compiler_1.TsCompiler(configSet, jestCacheFS);
    }
    TsJestCompiler.prototype.getResolvedModulesMap = function (fileContent, fileName) {
        return this._compilerInstance.getResolvedModulesMap(fileContent, fileName);
    };
    TsJestCompiler.prototype.getCompiledOutput = function (fileContent, fileName, supportsStaticESM) {
        return this._compilerInstance.getCompiledOutput(fileContent, fileName, supportsStaticESM);
    };
    return TsJestCompiler;
}());
exports.TsJestCompiler = TsJestCompiler;
