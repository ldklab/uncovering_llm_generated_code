import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function groupBy(keySelector, elementSelector, durationSelector, subjectSelector) {
    return operate((source, subscriber) => {
        const groups = new Map();
        const notify = (cb) => {
            groups.forEach(cb);
            cb(subscriber);
        };
        const handleError = (err) => notify((consumer) => consumer.error(err));
        const groupBySourceSubscriber = new GroupBySubscriber(subscriber, (value) => {
            try {
                const key = keySelector(value);
                let group = groups.get(key);
                if (!group) {
                    groups.set(key, (group = subjectSelector ? subjectSelector() : new Subject()));
                    const grouped = createGroupedObservable(key, group);
                    subscriber.next(grouped);
                    if (durationSelector) {
                        const durationSubscriber = new OperatorSubscriber(group, () => {
                            group.complete();
                            durationSubscriber === null || durationSubscriber === void 0 ? void 0 : durationSubscriber.unsubscribe();
                        }, undefined, undefined, () => groups.delete(key));
                        groupBySourceSubscriber.add(durationSelector(grouped).subscribe(durationSubscriber));
                    }
                }
                group.next(elementSelector ? elementSelector(value) : value);
            }
            catch (err) {
                handleError(err);
            }
        }, handleError, () => notify((consumer) => consumer.complete()), () => groups.clear());
        source.subscribe(groupBySourceSubscriber);
        function createGroupedObservable(key, groupSubject) {
            const result = new Observable((groupSubscriber) => {
                groupBySourceSubscriber.activeGroups++;
                const innerSub = groupSubject.subscribe(groupSubscriber);
                return () => {
                    innerSub.unsubscribe();
                    --groupBySourceSubscriber.activeGroups === 0 &&
                        groupBySourceSubscriber.teardownAttempted &&
                        groupBySourceSubscriber.unsubscribe();
                };
            });
            result.key = key;
            return result;
        }
    });
}
class GroupBySubscriber extends OperatorSubscriber {
    constructor() {
        super(...arguments);
        this.activeGroups = 0;
        this.teardownAttempted = false;
    }
    unsubscribe() {
        this.teardownAttempted = true;
        this.activeGroups === 0 && super.unsubscribe();
    }
}
//# sourceMappingURL=groupBy.js.map