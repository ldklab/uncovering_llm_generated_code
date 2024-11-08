import { ConnectableObservable } from '../observable/ConnectableObservable';
import { hasLift, operate } from '../util/lift';
import { isFunction } from '../util/isFunction';
export function multicast(subjectOrSubjectFactory, selector) {
    const subjectFactory = isFunction(subjectOrSubjectFactory) ? subjectOrSubjectFactory : () => subjectOrSubjectFactory;
    if (isFunction(selector)) {
        return operate((source, subscriber) => {
            const subject = subjectFactory();
            selector(subject).subscribe(subscriber).add(source.subscribe(subject));
        });
    }
    return (source) => {
        const connectable = new ConnectableObservable(source, subjectFactory);
        if (hasLift(source)) {
            connectable.lift = source.lift;
        }
        connectable.source = source;
        connectable.subjectFactory = subjectFactory;
        return connectable;
    };
}
//# sourceMappingURL=multicast.js.map