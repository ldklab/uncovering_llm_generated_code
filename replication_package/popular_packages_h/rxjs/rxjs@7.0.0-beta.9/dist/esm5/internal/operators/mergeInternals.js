import { innerFrom } from '../observable/from';
import { OperatorSubscriber } from './OperatorSubscriber';
export function mergeInternals(source, subscriber, project, concurrent, onBeforeNext, expand, innerSubScheduler, additionalTeardown) {
    var buffer = [];
    var active = 0;
    var index = 0;
    var isComplete = false;
    var checkComplete = function () {
        if (isComplete && !buffer.length && !active) {
            subscriber.complete();
        }
    };
    var outerNext = function (value) { return (active < concurrent ? doInnerSub(value) : buffer.push(value)); };
    var doInnerSub = function (value) {
        expand && subscriber.next(value);
        active++;
        innerFrom(project(value, index++)).subscribe(new OperatorSubscriber(subscriber, function (innerValue) {
            onBeforeNext === null || onBeforeNext === void 0 ? void 0 : onBeforeNext(innerValue);
            if (expand) {
                outerNext(innerValue);
            }
            else {
                subscriber.next(innerValue);
            }
        }, undefined, function () {
            active--;
            var _loop_1 = function () {
                var bufferedValue = buffer.shift();
                innerSubScheduler ? subscriber.add(innerSubScheduler.schedule(function () { return doInnerSub(bufferedValue); })) : doInnerSub(bufferedValue);
            };
            while (buffer.length && active < concurrent) {
                _loop_1();
            }
            checkComplete();
        }));
    };
    source.subscribe(new OperatorSubscriber(subscriber, outerNext, undefined, function () {
        isComplete = true;
        checkComplete();
    }));
    return function () {
        buffer = null;
        additionalTeardown === null || additionalTeardown === void 0 ? void 0 : additionalTeardown();
    };
}
//# sourceMappingURL=mergeInternals.js.map