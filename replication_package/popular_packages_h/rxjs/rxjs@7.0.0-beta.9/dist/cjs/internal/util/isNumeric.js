"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNumeric = void 0;
function isNumeric(val) {
    return !Array.isArray(val) && (val - parseFloat(val) + 1) >= 0;
}
exports.isNumeric = isNumeric;
//# sourceMappingURL=isNumeric.js.map