import { operate } from '../util/lift';
import { innerFrom } from '../observable/from';
import { OperatorSubscriber } from './OperatorSubscriber';
export function audit(durationSelector) {
    return operate(function (source, subscriber) {
        var hasValue = false;
        var lastValue = null;
        var durationSubscriber = null;
        var isComplete = false;
        var endDuration = function () {
            durationSubscriber === null || durationSubscriber === void 0 ? void 0 : durationSubscriber.unsubscribe();
            durationSubscriber = null;
            if (hasValue) {
                hasValue = false;
                var value = lastValue;
                lastValue = null;
                subscriber.next(value);
            }
            isComplete && subscriber.complete();
        };
        var cleanupDuration = function () {
            durationSubscriber = null;
            isComplete && subscriber.complete();
        };
        source.subscribe(new OperatorSubscriber(subscriber, function (value) {
            hasValue = true;
            lastValue = value;
            if (!durationSubscriber) {
                innerFrom(durationSelector(value)).subscribe((durationSubscriber = new OperatorSubscriber(subscriber, endDuration, undefined, cleanupDuration)));
            }
        }, undefined, function () {
            isComplete = true;
            (!hasValue || !durationSubscriber || durationSubscriber.closed) && subscriber.complete();
        }));
    });
}
//# sourceMappingURL=audit.js.map