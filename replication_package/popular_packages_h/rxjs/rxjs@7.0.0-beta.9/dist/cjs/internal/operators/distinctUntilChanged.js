"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distinctUntilChanged = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function distinctUntilChanged(compare, keySelector) {
    compare = compare !== null && compare !== void 0 ? compare : defaultCompare;
    return lift_1.operate(function (source, subscriber) {
        var prev;
        var first = true;
        source.subscribe(new OperatorSubscriber_1.OperatorSubscriber(subscriber, function (value) {
            ((first && ((prev = value), 1)) || !compare(prev, (prev = keySelector ? keySelector(value) : value))) &&
                subscriber.next(value);
            first = false;
        }));
    });
}
exports.distinctUntilChanged = distinctUntilChanged;
function defaultCompare(a, b) {
    return a === b;
}
//# sourceMappingURL=distinctUntilChanged.js.map