"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multicast = void 0;
var ConnectableObservable_1 = require("../observable/ConnectableObservable");
var lift_1 = require("../util/lift");
var isFunction_1 = require("../util/isFunction");
function multicast(subjectOrSubjectFactory, selector) {
    var subjectFactory = isFunction_1.isFunction(subjectOrSubjectFactory) ? subjectOrSubjectFactory : function () { return subjectOrSubjectFactory; };
    if (isFunction_1.isFunction(selector)) {
        return lift_1.operate(function (source, subscriber) {
            var subject = subjectFactory();
            selector(subject).subscribe(subscriber).add(source.subscribe(subject));
        });
    }
    return function (source) {
        var connectable = new ConnectableObservable_1.ConnectableObservable(source, subjectFactory);
        if (lift_1.hasLift(source)) {
            connectable.lift = source.lift;
        }
        connectable.source = source;
        connectable.subjectFactory = subjectFactory;
        return connectable;
    };
}
exports.multicast = multicast;
//# sourceMappingURL=multicast.js.map