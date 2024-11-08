"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _skipFirstGeneratorNext(fn) {
    return function() {
        var it = fn.apply(this, arguments);
        it.next();
        return it;
    };
}
exports.default = _skipFirstGeneratorNext;
