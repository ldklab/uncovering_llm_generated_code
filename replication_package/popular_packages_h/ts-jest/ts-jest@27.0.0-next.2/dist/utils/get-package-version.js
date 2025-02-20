"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageVersion = void 0;
function getPackageVersion(moduleName) {
    try {
        return require(moduleName + "/package.json").version;
    }
    catch (err) { }
    return;
}
exports.getPackageVersion = getPackageVersion;
