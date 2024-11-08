"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.materialize = void 0;
var Notification_1 = require("../Notification");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function materialize() {
    return lift_1.operate(function (source, subscriber) {
        source.subscribe(new OperatorSubscriber_1.OperatorSubscriber(subscriber, function (value) {
            subscriber.next(Notification_1.Notification.createNext(value));
        }, function (err) {
            subscriber.next(Notification_1.Notification.createError(err));
            subscriber.complete();
        }, function () {
            subscriber.next(Notification_1.Notification.createComplete());
            subscriber.complete();
        }));
    });
}
exports.materialize = materialize;
//# sourceMappingURL=materialize.js.map