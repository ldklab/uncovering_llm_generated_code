import { isFunction } from './util/isFunction';
import { isSubscription, Subscription } from './Subscription';
import { config } from './config';
import { reportUnhandledError } from './util/reportUnhandledError';
import { noop } from './util/noop';
import { nextNotification, errorNotification, COMPLETE_NOTIFICATION } from './NotificationFactories';
import { timeoutProvider } from './scheduler/timeoutProvider';
export class Subscriber extends Subscription {
    constructor(destination) {
        super();
        this.isStopped = false;
        if (destination) {
            this.destination = destination;
            if (isSubscription(destination)) {
                destination.add(this);
            }
        }
        else {
            this.destination = EMPTY_OBSERVER;
        }
    }
    static create(next, error, complete) {
        return new SafeSubscriber(next, error, complete);
    }
    next(value) {
        if (this.isStopped) {
            handleStoppedNotification(nextNotification(value), this);
        }
        else {
            this._next(value);
        }
    }
    error(err) {
        if (this.isStopped) {
            handleStoppedNotification(errorNotification(err), this);
        }
        else {
            this.isStopped = true;
            this._error(err);
        }
    }
    complete() {
        if (this.isStopped) {
            handleStoppedNotification(COMPLETE_NOTIFICATION, this);
        }
        else {
            this.isStopped = true;
            this._complete();
        }
    }
    unsubscribe() {
        if (!this.closed) {
            this.isStopped = true;
            super.unsubscribe();
        }
    }
    _next(value) {
        this.destination.next(value);
    }
    _error(err) {
        this.destination.error(err);
        this.unsubscribe();
    }
    _complete() {
        this.destination.complete();
        this.unsubscribe();
    }
}
export class SafeSubscriber extends Subscriber {
    constructor(observerOrNext, error, complete) {
        super();
        this.destination = EMPTY_OBSERVER;
        if ((observerOrNext || error || complete) && observerOrNext !== EMPTY_OBSERVER) {
            let next;
            if (isFunction(observerOrNext)) {
                next = observerOrNext;
            }
            else if (observerOrNext) {
                ({ next, error, complete } = observerOrNext);
                let context;
                if (this && config.useDeprecatedNextContext) {
                    context = Object.create(observerOrNext);
                    context.unsubscribe = () => this.unsubscribe();
                }
                else {
                    context = observerOrNext;
                }
                next = next === null || next === void 0 ? void 0 : next.bind(context);
                error = error === null || error === void 0 ? void 0 : error.bind(context);
                complete = complete === null || complete === void 0 ? void 0 : complete.bind(context);
            }
            this.destination = {
                next: next || noop,
                error: error || defaultErrorHandler,
                complete: complete || noop,
            };
        }
    }
}
function defaultErrorHandler(err) {
    if (config.useDeprecatedSynchronousErrorHandling) {
        throw err;
    }
    reportUnhandledError(err);
}
function handleStoppedNotification(notification, subscriber) {
    const { onStoppedNotification } = config;
    onStoppedNotification && timeoutProvider.setTimeout(() => onStoppedNotification(notification, subscriber));
}
export const EMPTY_OBSERVER = {
    closed: true,
    next: noop,
    error: defaultErrorHandler,
    complete: noop,
};
//# sourceMappingURL=Subscriber.js.map