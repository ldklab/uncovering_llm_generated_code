"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var _defineProperty = _interopRequireDefault(require("./_define_property"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _objectSpread(target) {
    var _loop = function(i) {
        var source = arguments[i] != null ? arguments[i] : {
        };
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty.default(target, key, source[key]);
        });
    };
    for(var i = 1; i < arguments.length; i++)_loop(i);
    return target;
}
exports.default = _objectSpread;
