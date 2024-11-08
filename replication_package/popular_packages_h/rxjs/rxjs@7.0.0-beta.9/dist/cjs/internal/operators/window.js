"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.window = void 0;
var Subject_1 = require("../Subject");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function window(windowBoundaries) {
    return lift_1.operate(function (source, subscriber) {
        var windowSubject = new Subject_1.Subject();
        subscriber.next(windowSubject.asObservable());
        var windowSubscribe = function (sourceOrNotifier, next) {
            return sourceOrNotifier.subscribe(new OperatorSubscriber_1.OperatorSubscriber(subscriber, next, function (err) {
                windowSubject.error(err);
                subscriber.error(err);
            }, function () {
                windowSubject.complete();
                subscriber.complete();
            }));
        };
        windowSubscribe(source, function (value) { return windowSubject.next(value); });
        windowSubscribe(windowBoundaries, function () {
            windowSubject.complete();
            subscriber.next((windowSubject = new Subject_1.Subject()));
        });
        return function () {
            windowSubject.unsubscribe();
            windowSubject = null;
        };
    });
}
exports.window = window;
//# sourceMappingURL=window.js.map