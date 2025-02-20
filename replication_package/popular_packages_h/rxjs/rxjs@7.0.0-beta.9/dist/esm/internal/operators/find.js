import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function find(predicate, thisArg) {
    return operate(createFind(predicate, thisArg, 'value'));
}
export function createFind(predicate, thisArg, emit) {
    const findIndex = emit === 'index';
    return (source, subscriber) => {
        let index = 0;
        source.subscribe(new OperatorSubscriber(subscriber, (value) => {
            const i = index++;
            if (predicate.call(thisArg, value, i, source)) {
                subscriber.next(findIndex ? i : value);
                subscriber.complete();
            }
        }, undefined, () => {
            subscriber.next(findIndex ? -1 : undefined);
            subscriber.complete();
        }));
    };
}
//# sourceMappingURL=find.js.map