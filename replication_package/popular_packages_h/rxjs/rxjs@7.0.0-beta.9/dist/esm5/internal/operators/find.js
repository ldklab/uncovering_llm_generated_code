import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function find(predicate, thisArg) {
    return operate(createFind(predicate, thisArg, 'value'));
}
export function createFind(predicate, thisArg, emit) {
    var findIndex = emit === 'index';
    return function (source, subscriber) {
        var index = 0;
        source.subscribe(new OperatorSubscriber(subscriber, function (value) {
            var i = index++;
            if (predicate.call(thisArg, value, i, source)) {
                subscriber.next(findIndex ? i : value);
                subscriber.complete();
            }
        }, undefined, function () {
            subscriber.next(findIndex ? -1 : undefined);
            subscriber.complete();
        }));
    };
}
//# sourceMappingURL=find.js.map