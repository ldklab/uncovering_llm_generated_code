import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function defaultIfEmpty(defaultValue) {
    if (defaultValue === void 0) { defaultValue = null; }
    return operate(function (source, subscriber) {
        var hasValue = false;
        source.subscribe(new OperatorSubscriber(subscriber, function (value) {
            hasValue = true;
            subscriber.next(value);
        }, undefined, function () {
            if (!hasValue) {
                subscriber.next(defaultValue);
            }
            subscriber.complete();
        }));
    });
}
//# sourceMappingURL=defaultIfEmpty.js.map