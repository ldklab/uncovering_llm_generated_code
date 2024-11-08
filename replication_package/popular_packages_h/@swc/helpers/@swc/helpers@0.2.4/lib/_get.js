"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var _superPropBase = _interopRequireDefault(require("./_super_prop_base"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
        _get = Reflect.get;
    } else {
        _get = function _get1(target1, property1, receiver1) {
            var base = _superPropBase.default(target1, property1);
            if (!base) return;
            var desc = Object.getOwnPropertyDescriptor(base, property1);
            if (desc.get) {
                return desc.get.call(receiver1);
            }
            return desc.value;
        };
    }
    return _get(target, property, receiver || target);
}
exports.default = _get;
