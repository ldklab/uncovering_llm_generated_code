import { operate } from '../util/lift';
import { innerFrom } from '../observable/from';
import { OperatorSubscriber } from './OperatorSubscriber';
export function exhaust() {
    return operate(function (source, subscriber) {
        var isComplete = false;
        var innerSub = null;
        source.subscribe(new OperatorSubscriber(subscriber, function (inner) {
            if (!innerSub) {
                innerSub = innerFrom(inner).subscribe(new OperatorSubscriber(subscriber, undefined, undefined, function () {
                    innerSub = null;
                    isComplete && subscriber.complete();
                }));
            }
        }, undefined, function () {
            isComplete = true;
            !innerSub && subscriber.complete();
        }));
    });
}
//# sourceMappingURL=exhaust.js.map