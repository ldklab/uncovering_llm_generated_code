import { __values } from "tslib";
import { Subscription } from '../Subscription';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { arrRemove } from '../util/arrRemove';
import { asyncScheduler } from '../scheduler/async';
import { popScheduler } from '../util/args';
export function bufferTime(bufferTimeSpan) {
    var _a, _b;
    var otherArgs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        otherArgs[_i - 1] = arguments[_i];
    }
    var scheduler = (_a = popScheduler(otherArgs)) !== null && _a !== void 0 ? _a : asyncScheduler;
    var bufferCreationInterval = (_b = otherArgs[0]) !== null && _b !== void 0 ? _b : null;
    var maxBufferSize = otherArgs[1] || Infinity;
    return operate(function (source, subscriber) {
        var bufferRecords = [];
        var restartOnEmit = false;
        var emit = function (record) {
            var buffer = record.buffer, subs = record.subs;
            subs.unsubscribe();
            arrRemove(bufferRecords, record);
            subscriber.next(buffer);
            restartOnEmit && startBuffer();
        };
        var startBuffer = function () {
            if (bufferRecords) {
                var subs = new Subscription();
                subscriber.add(subs);
                var buffer = [];
                var record_1 = {
                    buffer: buffer,
                    subs: subs,
                };
                bufferRecords.push(record_1);
                subs.add(scheduler.schedule(function () { return emit(record_1); }, bufferTimeSpan));
            }
        };
        bufferCreationInterval !== null && bufferCreationInterval >= 0
            ?
                subscriber.add(scheduler.schedule(function () {
                    startBuffer();
                    !this.closed && subscriber.add(this.schedule(null, bufferCreationInterval));
                }, bufferCreationInterval))
            : (restartOnEmit = true);
        startBuffer();
        var bufferTimeSubscriber = new OperatorSubscriber(subscriber, function (value) {
            var e_1, _a;
            var recordsCopy = bufferRecords.slice();
            try {
                for (var recordsCopy_1 = __values(recordsCopy), recordsCopy_1_1 = recordsCopy_1.next(); !recordsCopy_1_1.done; recordsCopy_1_1 = recordsCopy_1.next()) {
                    var record = recordsCopy_1_1.value;
                    var buffer = record.buffer;
                    buffer.push(value);
                    maxBufferSize <= buffer.length && emit(record);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (recordsCopy_1_1 && !recordsCopy_1_1.done && (_a = recordsCopy_1.return)) _a.call(recordsCopy_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }, undefined, function () {
            while (bufferRecords === null || bufferRecords === void 0 ? void 0 : bufferRecords.length) {
                subscriber.next(bufferRecords.shift().buffer);
            }
            bufferTimeSubscriber === null || bufferTimeSubscriber === void 0 ? void 0 : bufferTimeSubscriber.unsubscribe();
            subscriber.complete();
            subscriber.unsubscribe();
        }, function () { return (bufferRecords = null); });
        source.subscribe(bufferTimeSubscriber);
    });
}
//# sourceMappingURL=bufferTime.js.map