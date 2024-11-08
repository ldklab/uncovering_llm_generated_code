"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _newArrowCheck(innerThis, boundThis) {
    if (innerThis !== boundThis) {
        throw new TypeError("Cannot instantiate an arrow function");
    }
}
exports.default = _newArrowCheck;
