import { __read, __spread } from "tslib";
import { operate } from '../util/lift';
import { argsOrArgArray } from '../util/argsOrArgArray';
import { internalFromArray } from '../observable/fromArray';
import { mergeAll } from './mergeAll';
import { popNumber, popScheduler } from '../util/args';
export function merge() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = popScheduler(args);
    var concurrent = popNumber(args, Infinity);
    args = argsOrArgArray(args);
    return operate(function (source, subscriber) {
        mergeAll(concurrent)(internalFromArray(__spread([source], args), scheduler)).subscribe(subscriber);
    });
}
export function mergeWith() {
    var otherSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherSources[_i] = arguments[_i];
    }
    return merge.apply(void 0, __spread(otherSources));
}
//# sourceMappingURL=mergeWith.js.map