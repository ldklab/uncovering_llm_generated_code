"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var _getPrototypeOf = _interopRequireDefault(require("./_get_prototype_of"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _superPropBase(object, property) {
    while(!Object.prototype.hasOwnProperty.call(object, property)){
        object = _getPrototypeOf.default(object);
        if (object === null) break;
    }
    return object;
}
exports.default = _superPropBase;
