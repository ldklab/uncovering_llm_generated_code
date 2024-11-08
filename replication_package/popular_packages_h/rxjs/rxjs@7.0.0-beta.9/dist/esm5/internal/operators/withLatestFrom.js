import { __read, __spread } from "tslib";
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../observable/from';
import { identity } from '../util/identity';
import { noop } from '../util/noop';
import { popResultSelector } from '../util/args';
export function withLatestFrom() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    var project = popResultSelector(inputs);
    return operate(function (source, subscriber) {
        var len = inputs.length;
        var otherValues = new Array(len);
        var hasValue = inputs.map(function () { return false; });
        var ready = false;
        var _loop_1 = function (i) {
            innerFrom(inputs[i]).subscribe(new OperatorSubscriber(subscriber, function (value) {
                otherValues[i] = value;
                if (!ready && !hasValue[i]) {
                    hasValue[i] = true;
                    (ready = hasValue.every(identity)) && (hasValue = null);
                }
            }, undefined, noop));
        };
        for (var i = 0; i < len; i++) {
            _loop_1(i);
        }
        source.subscribe(new OperatorSubscriber(subscriber, function (value) {
            if (ready) {
                var values = __spread([value], otherValues);
                subscriber.next(project ? project.apply(void 0, __spread(values)) : values);
            }
        }));
    });
}
//# sourceMappingURL=withLatestFrom.js.map