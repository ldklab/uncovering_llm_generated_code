import { __read, __spread } from "tslib";
import { Observable } from '../Observable';
import { map } from '../operators/map';
import { argsArgArrayOrObject } from '../util/argsArgArrayOrObject';
import { innerFrom } from './from';
import { popResultSelector } from '../util/args';
export function forkJoin() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var resultSelector = popResultSelector(args);
    var _a = argsArgArrayOrObject(args), sources = _a.args, keys = _a.keys;
    if (resultSelector) {
        return forkJoinInternal(sources, keys).pipe(map(function (values) { return resultSelector.apply(void 0, __spread(values)); }));
    }
    return forkJoinInternal(sources, keys);
}
function forkJoinInternal(sources, keys) {
    return new Observable(function (subscriber) {
        var len = sources.length;
        if (len === 0) {
            subscriber.complete();
            return;
        }
        var values = new Array(len);
        var completed = 0;
        var emitted = 0;
        var _loop_1 = function (sourceIndex) {
            var source = innerFrom(sources[sourceIndex]);
            var hasValue = false;
            subscriber.add(source.subscribe({
                next: function (value) {
                    if (!hasValue) {
                        hasValue = true;
                        emitted++;
                    }
                    values[sourceIndex] = value;
                },
                error: function (err) { return subscriber.error(err); },
                complete: function () {
                    completed++;
                    if (completed === len || !hasValue) {
                        if (emitted === len) {
                            subscriber.next(keys ? keys.reduce(function (result, key, i) { return ((result[key] = values[i]), result); }, {}) : values);
                        }
                        subscriber.complete();
                    }
                },
            }));
        };
        for (var sourceIndex = 0; sourceIndex < len; sourceIndex++) {
            _loop_1(sourceIndex);
        }
    });
}
//# sourceMappingURL=forkJoin.js.map