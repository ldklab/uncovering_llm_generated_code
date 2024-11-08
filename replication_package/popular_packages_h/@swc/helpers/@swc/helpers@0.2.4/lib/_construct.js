"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
        Date.prototype.toString.call(Reflect.construct(Date, [], function() {
        }));
        return true;
    } catch (e) {
        return false;
    }
}
function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
        _construct = Reflect.construct;
    } else {
        _construct = function _construct1(Parent1, args1, Class1) {
            var a = [
                null
            ];
            a.push.apply(a, args1);
            var Constructor = Function.bind.apply(Parent1, a);
            var instance = new Constructor();
            if (Class1) _setPrototypeOf(instance, Class1.prototype);
            return instance;
        };
    }
    return _construct.apply(null, arguments);
}
exports.default = _construct;
