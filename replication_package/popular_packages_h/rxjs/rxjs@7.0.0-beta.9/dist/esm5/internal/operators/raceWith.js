import { __read, __spread } from "tslib";
import { raceInit } from '../observable/race';
import { operate } from '../util/lift';
import { argsOrArgArray } from "../util/argsOrArgArray";
import { identity } from '../util/identity';
export function race() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return raceWith.apply(void 0, __spread(argsOrArgArray(args)));
}
export function raceWith() {
    var otherSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherSources[_i] = arguments[_i];
    }
    return !otherSources.length ? identity : operate(function (source, subscriber) {
        raceInit(__spread([source], otherSources))(subscriber);
    });
}
//# sourceMappingURL=raceWith.js.map