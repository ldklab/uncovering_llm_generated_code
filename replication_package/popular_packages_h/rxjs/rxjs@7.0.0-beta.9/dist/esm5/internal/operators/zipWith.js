import { __read, __spread } from "tslib";
import { zip as zipStatic } from '../observable/zip';
import { operate } from '../util/lift';
export function zip() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    return operate(function (source, subscriber) {
        zipStatic.apply(void 0, __spread([source], sources)).subscribe(subscriber);
    });
}
export function zipWith() {
    var otherInputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherInputs[_i] = arguments[_i];
    }
    return zip.apply(void 0, __spread(otherInputs));
}
//# sourceMappingURL=zipWith.js.map