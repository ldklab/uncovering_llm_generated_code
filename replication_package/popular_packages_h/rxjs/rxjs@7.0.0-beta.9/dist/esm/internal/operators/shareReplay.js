import { ReplaySubject } from '../ReplaySubject';
import { operate } from '../util/lift';
export function shareReplay(configOrBufferSize, windowTime, scheduler) {
    let config;
    if (configOrBufferSize && typeof configOrBufferSize === 'object') {
        config = configOrBufferSize;
    }
    else {
        config = {
            bufferSize: configOrBufferSize,
            windowTime,
            refCount: false,
            scheduler
        };
    }
    return operate(shareReplayOperator(config));
}
function shareReplayOperator({ bufferSize = Infinity, windowTime = Infinity, refCount: useRefCount, scheduler }) {
    let subject;
    let refCount = 0;
    let subscription;
    return (source, subscriber) => {
        refCount++;
        let innerSub;
        if (!subject) {
            subject = new ReplaySubject(bufferSize, windowTime, scheduler);
            innerSub = subject.subscribe(subscriber);
            subscription = source.subscribe({
                next(value) { subject.next(value); },
                error(err) {
                    const dest = subject;
                    subscription = undefined;
                    subject = undefined;
                    dest.error(err);
                },
                complete() {
                    subscription = undefined;
                    subject.complete();
                },
            });
            if (subscription.closed) {
                subscription = undefined;
            }
        }
        else {
            innerSub = subject.subscribe(subscriber);
        }
        subscriber.add(() => {
            refCount--;
            innerSub.unsubscribe();
            if (useRefCount && refCount === 0 && subscription) {
                subscription.unsubscribe();
                subscription = undefined;
                subject = undefined;
            }
        });
    };
}
//# sourceMappingURL=shareReplay.js.map