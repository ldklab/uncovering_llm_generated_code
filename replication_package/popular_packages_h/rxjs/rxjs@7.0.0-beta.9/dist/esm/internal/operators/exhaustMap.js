import { map } from './map';
import { innerFrom } from '../observable/from';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function exhaustMap(project, resultSelector) {
    if (resultSelector) {
        return (source) => source.pipe(exhaustMap((a, i) => innerFrom(project(a, i)).pipe(map((b, ii) => resultSelector(a, b, i, ii)))));
    }
    return operate((source, subscriber) => {
        let index = 0;
        let innerSub = null;
        let isComplete = false;
        source.subscribe(new OperatorSubscriber(subscriber, (outerValue) => {
            if (!innerSub) {
                innerSub = new OperatorSubscriber(subscriber, undefined, undefined, () => {
                    innerSub = null;
                    isComplete && subscriber.complete();
                });
                innerFrom(project(outerValue, index++)).subscribe(innerSub);
            }
        }, undefined, () => {
            isComplete = true;
            !innerSub && subscriber.complete();
        }));
    });
}
//# sourceMappingURL=exhaustMap.js.map