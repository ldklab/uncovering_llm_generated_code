"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOutput = exports.SOURCE_MAPPING_PREFIX = void 0;
var json_1 = require("../utils/json");
exports.SOURCE_MAPPING_PREFIX = 'sourceMappingURL=';
function updateOutput(outputText, normalizedFileName, sourceMap) {
    var base64Map = Buffer.from(updateSourceMap(sourceMap, normalizedFileName), 'utf8').toString('base64');
    var sourceMapContent = "data:application/json;charset=utf-8;base64," + base64Map;
    return (outputText.slice(0, outputText.lastIndexOf(exports.SOURCE_MAPPING_PREFIX) + exports.SOURCE_MAPPING_PREFIX.length) + sourceMapContent);
}
exports.updateOutput = updateOutput;
var updateSourceMap = function (sourceMapText, normalizedFileName) {
    var sourceMap = JSON.parse(sourceMapText);
    sourceMap.file = normalizedFileName;
    sourceMap.sources = [normalizedFileName];
    delete sourceMap.sourceRoot;
    return json_1.stringify(sourceMap);
};
