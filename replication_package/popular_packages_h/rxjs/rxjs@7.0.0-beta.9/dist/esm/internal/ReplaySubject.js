import { Subject } from './Subject';
import { dateTimestampProvider } from './scheduler/dateTimestampProvider';
export class ReplaySubject extends Subject {
    constructor(bufferSize = Infinity, windowTime = Infinity, timestampProvider = dateTimestampProvider) {
        super();
        this.bufferSize = bufferSize;
        this.windowTime = windowTime;
        this.timestampProvider = timestampProvider;
        this.buffer = [];
        this.infiniteTimeWindow = true;
        this.infiniteTimeWindow = windowTime === Infinity;
        this.bufferSize = Math.max(1, bufferSize);
        this.windowTime = Math.max(1, windowTime);
    }
    next(value) {
        const { isStopped, buffer, infiniteTimeWindow, timestampProvider, windowTime } = this;
        if (!isStopped) {
            buffer.push(value);
            !infiniteTimeWindow && buffer.push(timestampProvider.now() + windowTime);
        }
        this.trimBuffer();
        super.next(value);
    }
    _subscribe(subscriber) {
        this._throwIfClosed();
        this.trimBuffer();
        const subscription = this._innerSubscribe(subscriber);
        const { infiniteTimeWindow, buffer } = this;
        const copy = buffer.slice();
        for (let i = 0; i < copy.length && !subscriber.closed; i += infiniteTimeWindow ? 1 : 2) {
            subscriber.next(copy[i]);
        }
        this._checkFinalizedStatuses(subscriber);
        return subscription;
    }
    trimBuffer() {
        const { bufferSize, timestampProvider, buffer, infiniteTimeWindow } = this;
        const adjustedBufferSize = (infiniteTimeWindow ? 1 : 2) * bufferSize;
        bufferSize < Infinity && adjustedBufferSize < buffer.length && buffer.splice(0, buffer.length - adjustedBufferSize);
        if (!infiniteTimeWindow) {
            const now = timestampProvider.now();
            let last = 0;
            for (let i = 1; i < buffer.length && buffer[i] <= now; i += 2) {
                last = i;
            }
            last && buffer.splice(0, last + 1);
        }
    }
}
//# sourceMappingURL=ReplaySubject.js.map