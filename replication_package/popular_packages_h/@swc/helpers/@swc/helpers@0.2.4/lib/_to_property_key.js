"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var _typeOf = _interopRequireDefault(require("./_type_of"));
var _toPrimitive = _interopRequireDefault(require("./_to_primitive"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _toPropertyKey(arg) {
    var key = _toPrimitive.default(arg, "string");
    return _typeOf.default(key) === "symbol" ? key : String(key);
}
exports.default = _toPropertyKey;
