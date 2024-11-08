import { Subject } from '../Subject';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function window(windowBoundaries) {
    return operate((source, subscriber) => {
        let windowSubject = new Subject();
        subscriber.next(windowSubject.asObservable());
        const windowSubscribe = (sourceOrNotifier, next) => sourceOrNotifier.subscribe(new OperatorSubscriber(subscriber, next, (err) => {
            windowSubject.error(err);
            subscriber.error(err);
        }, () => {
            windowSubject.complete();
            subscriber.complete();
        }));
        windowSubscribe(source, (value) => windowSubject.next(value));
        windowSubscribe(windowBoundaries, () => {
            windowSubject.complete();
            subscriber.next((windowSubject = new Subject()));
        });
        return () => {
            windowSubject.unsubscribe();
            windowSubject = null;
        };
    });
}
//# sourceMappingURL=window.js.map