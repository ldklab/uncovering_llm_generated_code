import { Subject } from '../Subject';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function windowCount(windowSize, startWindowEvery = 0) {
    const startEvery = startWindowEvery > 0 ? startWindowEvery : windowSize;
    return operate((source, subscriber) => {
        let windows = [new Subject()];
        let starts = [];
        let count = 0;
        subscriber.next(windows[0].asObservable());
        source.subscribe(new OperatorSubscriber(subscriber, (value) => {
            for (const window of windows) {
                window.next(value);
            }
            const c = count - windowSize + 1;
            if (c >= 0 && c % startEvery === 0) {
                windows.shift().complete();
            }
            if (++count % startEvery === 0) {
                const window = new Subject();
                windows.push(window);
                subscriber.next(window.asObservable());
            }
        }, (err) => {
            while (windows.length > 0) {
                windows.shift().error(err);
            }
            subscriber.error(err);
        }, () => {
            while (windows.length > 0) {
                windows.shift().complete();
            }
            subscriber.complete();
        }, () => {
            starts = null;
            windows = null;
        }));
    });
}
//# sourceMappingURL=windowCount.js.map