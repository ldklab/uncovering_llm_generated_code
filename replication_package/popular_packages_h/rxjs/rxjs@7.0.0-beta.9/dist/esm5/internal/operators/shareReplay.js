import { ReplaySubject } from '../ReplaySubject';
import { operate } from '../util/lift';
export function shareReplay(configOrBufferSize, windowTime, scheduler) {
    var config;
    if (configOrBufferSize && typeof configOrBufferSize === 'object') {
        config = configOrBufferSize;
    }
    else {
        config = {
            bufferSize: configOrBufferSize,
            windowTime: windowTime,
            refCount: false,
            scheduler: scheduler
        };
    }
    return operate(shareReplayOperator(config));
}
function shareReplayOperator(_a) {
    var _b = _a.bufferSize, bufferSize = _b === void 0 ? Infinity : _b, _c = _a.windowTime, windowTime = _c === void 0 ? Infinity : _c, useRefCount = _a.refCount, scheduler = _a.scheduler;
    var subject;
    var refCount = 0;
    var subscription;
    return function (source, subscriber) {
        refCount++;
        var innerSub;
        if (!subject) {
            subject = new ReplaySubject(bufferSize, windowTime, scheduler);
            innerSub = subject.subscribe(subscriber);
            subscription = source.subscribe({
                next: function (value) { subject.next(value); },
                error: function (err) {
                    var dest = subject;
                    subscription = undefined;
                    subject = undefined;
                    dest.error(err);
                },
                complete: function () {
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
        subscriber.add(function () {
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