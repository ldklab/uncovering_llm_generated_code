import { Subject } from '../Subject';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function window(windowBoundaries) {
    return operate(function (source, subscriber) {
        var windowSubject = new Subject();
        subscriber.next(windowSubject.asObservable());
        var windowSubscribe = function (sourceOrNotifier, next) {
            return sourceOrNotifier.subscribe(new OperatorSubscriber(subscriber, next, function (err) {
                windowSubject.error(err);
                subscriber.error(err);
            }, function () {
                windowSubject.complete();
                subscriber.complete();
            }));
        };
        windowSubscribe(source, function (value) { return windowSubject.next(value); });
        windowSubscribe(windowBoundaries, function () {
            windowSubject.complete();
            subscriber.next((windowSubject = new Subject()));
        });
        return function () {
            windowSubject.unsubscribe();
            windowSubject = null;
        };
    });
}
//# sourceMappingURL=window.js.map