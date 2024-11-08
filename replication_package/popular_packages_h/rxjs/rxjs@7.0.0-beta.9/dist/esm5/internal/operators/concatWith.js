import { __read, __spread } from "tslib";
import { operate } from '../util/lift';
import { concatAll } from './concatAll';
import { internalFromArray } from '../observable/fromArray';
import { popScheduler } from '../util/args';
export function concatWith() {
    var otherSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherSources[_i] = arguments[_i];
    }
    return concat.apply(void 0, __spread(otherSources));
}
export function concat() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = popScheduler(args);
    return operate(function (source, subscriber) {
        concatAll()(internalFromArray(__spread([source], args), scheduler)).subscribe(subscriber);
    });
}
//# sourceMappingURL=concatWith.js.map