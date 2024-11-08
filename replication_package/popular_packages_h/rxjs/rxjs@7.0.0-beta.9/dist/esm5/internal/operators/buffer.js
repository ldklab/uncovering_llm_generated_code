import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function buffer(closingNotifier) {
    return operate(function (source, subscriber) {
        var currentBuffer = [];
        source.subscribe(new OperatorSubscriber(subscriber, function (value) { return currentBuffer.push(value); }));
        closingNotifier.subscribe(new OperatorSubscriber(subscriber, function () {
            var b = currentBuffer;
            currentBuffer = [];
            subscriber.next(b);
        }));
        return function () {
            currentBuffer = null;
        };
    });
}
//# sourceMappingURL=buffer.js.map