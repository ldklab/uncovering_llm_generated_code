import { ConnectableObservable } from '../observable/ConnectableObservable';
import { hasLift, operate } from '../util/lift';
import { isFunction } from '../util/isFunction';
export function multicast(subjectOrSubjectFactory, selector) {
    var subjectFactory = isFunction(subjectOrSubjectFactory) ? subjectOrSubjectFactory : function () { return subjectOrSubjectFactory; };
    if (isFunction(selector)) {
        return operate(function (source, subscriber) {
            var subject = subjectFactory();
            selector(subject).subscribe(subscriber).add(source.subscribe(subject));
        });
    }
    return function (source) {
        var connectable = new ConnectableObservable(source, subjectFactory);
        if (hasLift(source)) {
            connectable.lift = source.lift;
        }
        connectable.source = source;
        connectable.subjectFactory = subjectFactory;
        return connectable;
    };
}
//# sourceMappingURL=multicast.js.map