import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function distinctUntilChanged(compare, keySelector) {
    compare = compare !== null && compare !== void 0 ? compare : defaultCompare;
    return operate((source, subscriber) => {
        let prev;
        let first = true;
        source.subscribe(new OperatorSubscriber(subscriber, (value) => {
            ((first && ((prev = value), 1)) || !compare(prev, (prev = keySelector ? keySelector(value) : value))) &&
                subscriber.next(value);
            first = false;
        }));
    });
}
function defaultCompare(a, b) {
    return a === b;
}
//# sourceMappingURL=distinctUntilChanged.js.map