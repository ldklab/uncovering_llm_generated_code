import { innerFrom } from '../observable/from';
import { OperatorSubscriber } from './OperatorSubscriber';
export function mergeInternals(source, subscriber, project, concurrent, onBeforeNext, expand, innerSubScheduler, additionalTeardown) {
    let buffer = [];
    let active = 0;
    let index = 0;
    let isComplete = false;
    const checkComplete = () => {
        if (isComplete && !buffer.length && !active) {
            subscriber.complete();
        }
    };
    const outerNext = (value) => (active < concurrent ? doInnerSub(value) : buffer.push(value));
    const doInnerSub = (value) => {
        expand && subscriber.next(value);
        active++;
        innerFrom(project(value, index++)).subscribe(new OperatorSubscriber(subscriber, (innerValue) => {
            onBeforeNext === null || onBeforeNext === void 0 ? void 0 : onBeforeNext(innerValue);
            if (expand) {
                outerNext(innerValue);
            }
            else {
                subscriber.next(innerValue);
            }
        }, undefined, () => {
            active--;
            while (buffer.length && active < concurrent) {
                const bufferedValue = buffer.shift();
                innerSubScheduler ? subscriber.add(innerSubScheduler.schedule(() => doInnerSub(bufferedValue))) : doInnerSub(bufferedValue);
            }
            checkComplete();
        }));
    };
    source.subscribe(new OperatorSubscriber(subscriber, outerNext, undefined, () => {
        isComplete = true;
        checkComplete();
    }));
    return () => {
        buffer = null;
        additionalTeardown === null || additionalTeardown === void 0 ? void 0 : additionalTeardown();
    };
}
//# sourceMappingURL=mergeInternals.js.map