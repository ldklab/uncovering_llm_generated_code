import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { arrRemove } from '../util/arrRemove';
export function bufferCount(bufferSize, startBufferEvery = null) {
    startBufferEvery = startBufferEvery !== null && startBufferEvery !== void 0 ? startBufferEvery : bufferSize;
    return operate((source, subscriber) => {
        let buffers = [];
        let count = 0;
        source.subscribe(new OperatorSubscriber(subscriber, (value) => {
            let toEmit = null;
            if (count++ % startBufferEvery === 0) {
                buffers.push([]);
            }
            for (const buffer of buffers) {
                buffer.push(value);
                if (bufferSize <= buffer.length) {
                    toEmit = toEmit !== null && toEmit !== void 0 ? toEmit : [];
                    toEmit.push(buffer);
                }
            }
            if (toEmit) {
                for (const buffer of toEmit) {
                    arrRemove(buffers, buffer);
                    subscriber.next(buffer);
                }
            }
        }, undefined, () => {
            for (const buffer of buffers) {
                subscriber.next(buffer);
            }
            subscriber.complete();
        }, () => {
            buffers = null;
        }));
    });
}
//# sourceMappingURL=bufferCount.js.map