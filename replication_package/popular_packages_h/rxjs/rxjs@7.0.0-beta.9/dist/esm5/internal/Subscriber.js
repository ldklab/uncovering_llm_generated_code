import { __extends } from "tslib";
import { isFunction } from './util/isFunction';
import { isSubscription, Subscription } from './Subscription';
import { config } from './config';
import { reportUnhandledError } from './util/reportUnhandledError';
import { noop } from './util/noop';
import { nextNotification, errorNotification, COMPLETE_NOTIFICATION } from './NotificationFactories';
import { timeoutProvider } from './scheduler/timeoutProvider';
var Subscriber = (function (_super) {
    __extends(Subscriber, _super);
    function Subscriber(destination) {
        var _this = _super.call(this) || this;
        _this.isStopped = false;
        if (destination) {
            _this.destination = destination;
            if (isSubscription(destination)) {
                destination.add(_this);
            }
        }
        else {
            _this.destination = EMPTY_OBSERVER;
        }
        return _this;
    }
    Subscriber.create = function (next, error, complete) {
        return new SafeSubscriber(next, error, complete);
    };
    Subscriber.prototype.next = function (value) {
        if (this.isStopped) {
            handleStoppedNotification(nextNotification(value), this);
        }
        else {
            this._next(value);
        }
    };
    Subscriber.prototype.error = function (err) {
        if (this.isStopped) {
            handleStoppedNotification(errorNotification(err), this);
        }
        else {
            this.isStopped = true;
            this._error(err);
        }
    };
    Subscriber.prototype.complete = function () {
        if (this.isStopped) {
            handleStoppedNotification(COMPLETE_NOTIFICATION, this);
        }
        else {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (!this.closed) {
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
        }
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        this.destination.error(err);
        this.unsubscribe();
    };
    Subscriber.prototype._complete = function () {
        this.destination.complete();
        this.unsubscribe();
    };
    return Subscriber;
}(Subscription));
export { Subscriber };
var SafeSubscriber = (function (_super) {
    __extends(SafeSubscriber, _super);
    function SafeSubscriber(observerOrNext, error, complete) {
        var _this = _super.call(this) || this;
        _this.destination = EMPTY_OBSERVER;
        if ((observerOrNext || error || complete) && observerOrNext !== EMPTY_OBSERVER) {
            var next = void 0;
            if (isFunction(observerOrNext)) {
                next = observerOrNext;
            }
            else if (observerOrNext) {
                (next = observerOrNext.next, error = observerOrNext.error, complete = observerOrNext.complete);
                var context_1;
                if (_this && config.useDeprecatedNextContext) {
                    context_1 = Object.create(observerOrNext);
                    context_1.unsubscribe = function () { return _this.unsubscribe(); };
                }
                else {
                    context_1 = observerOrNext;
                }
                next = next === null || next === void 0 ? void 0 : next.bind(context_1);
                error = error === null || error === void 0 ? void 0 : error.bind(context_1);
                complete = complete === null || complete === void 0 ? void 0 : complete.bind(context_1);
            }
            _this.destination = {
                next: next || noop,
                error: error || defaultErrorHandler,
                complete: complete || noop,
            };
        }
        return _this;
    }
    return SafeSubscriber;
}(Subscriber));
export { SafeSubscriber };
function defaultErrorHandler(err) {
    if (config.useDeprecatedSynchronousErrorHandling) {
        throw err;
    }
    reportUnhandledError(err);
}
function handleStoppedNotification(notification, subscriber) {
    var onStoppedNotification = config.onStoppedNotification;
    onStoppedNotification && timeoutProvider.setTimeout(function () { return onStoppedNotification(notification, subscriber); });
}
export var EMPTY_OBSERVER = {
    closed: true,
    next: noop,
    error: defaultErrorHandler,
    complete: noop,
};
//# sourceMappingURL=Subscriber.js.map