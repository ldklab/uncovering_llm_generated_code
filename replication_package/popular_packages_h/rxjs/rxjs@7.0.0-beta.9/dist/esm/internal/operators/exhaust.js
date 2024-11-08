import { operate } from '../util/lift';
import { innerFrom } from '../observable/from';
import { OperatorSubscriber } from './OperatorSubscriber';
export function exhaust() {
    return operate((source, subscriber) => {
        let isComplete = false;
        let innerSub = null;
        source.subscribe(new OperatorSubscriber(subscriber, (inner) => {
            if (!innerSub) {
                innerSub = innerFrom(inner).subscribe(new OperatorSubscriber(subscriber, undefined, undefined, () => {
                    innerSub = null;
                    isComplete && subscriber.complete();
                }));
            }
        }, undefined, () => {
            isComplete = true;
            !innerSub && subscriber.complete();
        }));
    });
}
//# sourceMappingURL=exhaust.js.map