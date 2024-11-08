"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buffer = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function buffer(closingNotifier) {
    return lift_1.operate(function (source, subscriber) {
        var currentBuffer = [];
        source.subscribe(new OperatorSubscriber_1.OperatorSubscriber(subscriber, function (value) { return currentBuffer.push(value); }));
        closingNotifier.subscribe(new OperatorSubscriber_1.OperatorSubscriber(subscriber, function () {
            var b = currentBuffer;
            currentBuffer = [];
            subscriber.next(b);
        }));
        return function () {
            currentBuffer = null;
        };
    });
}
exports.buffer = buffer;
//# sourceMappingURL=buffer.js.map