import { __extends } from "tslib";
import { Observable } from '../Observable';
import { argsArgArrayOrObject } from '../util/argsArgArrayOrObject';
import { Subscriber } from '../Subscriber';
import { from } from './from';
import { identity } from '../util/identity';
import { mapOneOrManyArgs } from '../util/mapOneOrManyArgs';
import { popResultSelector, popScheduler } from '../util/args';
export function combineLatest() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = popScheduler(args);
    var resultSelector = popResultSelector(args);
    var _a = argsArgArrayOrObject(args), observables = _a.args, keys = _a.keys;
    var result = new Observable(combineLatestInit(observables, scheduler, keys
        ?
            function (values) {
                var value = {};
                for (var i = 0; i < values.length; i++) {
                    value[keys[i]] = values[i];
                }
                return value;
            }
        :
            identity));
    if (resultSelector) {
        return result.pipe(mapOneOrManyArgs(resultSelector));
    }
    return result;
}
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
}(Subscriber));
export function combineLatestInit(observables, scheduler, valueTransform) {
    if (valueTransform === void 0) { valueTransform = identity; }
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
                    var source = from(observables[i], scheduler);
                    source.subscribe(new CombineLatestSubscriber(subscriber, function (value) {
                        values[i] = value;
                        if (waitingForFirstValues) {
                            hasValues[i] = true;
                            waitingForFirstValues = !hasValues.every(identity);
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
function maybeSchedule(scheduler, execute, subscription) {
    if (scheduler) {
        subscription.add(scheduler.schedule(execute));
    }
    else {
        execute();
    }
}
//# sourceMappingURL=combineLatest.js.map