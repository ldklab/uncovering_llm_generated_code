"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineLatestInit = exports.combineLatest = void 0;
var Observable_1 = require("../Observable");
var argsArgArrayOrObject_1 = require("../util/argsArgArrayOrObject");
var Subscriber_1 = require("../Subscriber");
var from_1 = require("./from");
var identity_1 = require("../util/identity");
var mapOneOrManyArgs_1 = require("../util/mapOneOrManyArgs");
var args_1 = require("../util/args");
function combineLatest() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args_1.popScheduler(args);
    var resultSelector = args_1.popResultSelector(args);
    var _a = argsArgArrayOrObject_1.argsArgArrayOrObject(args), observables = _a.args, keys = _a.keys;
    var result = new Observable_1.Observable(combineLatestInit(observables, scheduler, keys
        ?
            function (values) {
                var value = {};
                for (var i = 0; i < values.length; i++) {
                    value[keys[i]] = values[i];
                }
                return value;
            }
        :
            identity_1.identity));
    if (resultSelector) {
        return result.pipe(mapOneOrManyArgs_1.mapOneOrManyArgs(resultSelector));
    }
    return result;
}
exports.combineLatest = combineLatest;
var CombineLatestSubscriber = (function (_super) {
    __extends(CombineLatestSubscriber, _super);
    function CombineLatestSubscriber(destination, _next, shouldComplete) {
        var _this = _super.call(this, destination) || this;
        _this._next = _next;
        _this.shouldComplete = shouldComplete;
        return _this;
    }
    CombineLatestSubscriber.prototype._complete = function () {
        if (this.shouldComplete()) {
            _super.prototype._complete.call(this);
        }
        else {
            this.unsubscribe();
        }
    };
    return CombineLatestSubscriber;
}(Subscriber_1.Subscriber));
function combineLatestInit(observables, scheduler, valueTransform) {
    if (valueTransform === void 0) { valueTransform = identity_1.identity; }
    return function (subscriber) {
        var primarySubscribe = function () {
            var length = observables.length;
            var values = new Array(length);
            var active = length;
            var hasValues = observables.map(function () { return false; });
            var waitingForFirstValues = true;
            var emit = function () { return subscriber.next(valueTransform(values.slice())); };
            var _loop_1 = function (i) {
                var subscribe = function () {
                    var source = from_1.from(observables[i], scheduler);
                    source.subscribe(new CombineLatestSubscriber(subscriber, function (value) {
                        values[i] = value;
                        if (waitingForFirstValues) {
                            hasValues[i] = true;
                            waitingForFirstValues = !hasValues.every(identity_1.identity);
                        }
                        if (!waitingForFirstValues) {
                            emit();
                        }
                    }, function () { return --active === 0; }));
                };
                maybeSchedule(scheduler, subscribe, subscriber);
            };
            for (var i = 0; i < length; i++) {
                _loop_1(i);
            }
        };
        maybeSchedule(scheduler, primarySubscribe, subscriber);
    };
}
exports.combineLatestInit = combineLatestInit;
function maybeSchedule(scheduler, execute, subscription) {
    if (scheduler) {
        subscription.add(scheduler.schedule(execute));
    }
    else {
        execute();
    }
}
//# sourceMappingURL=combineLatest.js.map