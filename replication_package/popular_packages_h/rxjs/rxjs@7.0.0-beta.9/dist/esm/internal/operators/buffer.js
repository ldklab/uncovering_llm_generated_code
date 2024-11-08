import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function buffer(closingNotifier) {
    return operate((source, subscriber) => {
        let currentBuffer = [];
        source.subscribe(new OperatorSubscriber(subscriber, (value) => currentBuffer.push(value)));
        closingNotifier.subscribe(new OperatorSubscriber(subscriber, () => {
            const b = currentBuffer;
            currentBuffer = [];
            subscriber.next(b);
        }));
        return () => {
            currentBuffer = null;
        };
    });
}
//# sourceMappingURL=buffer.js.map