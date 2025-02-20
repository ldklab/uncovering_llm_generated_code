"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalize = void 0;
var lift_1 = require("../util/lift");
function finalize(callback) {
    return lift_1.operate(function (source, subscriber) {
        source.subscribe(subscriber);
        subscriber.add(callback);
    });
}
exports.finalize = finalize;
//# sourceMappingURL=finalize.js.map