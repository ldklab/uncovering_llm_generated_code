import { __read, __spread } from "tslib";
import { map } from "../operators/map";
var isArray = Array.isArray;
function callOrApply(fn, args) {
    return isArray(args) ? fn.apply(void 0, __spread(args)) : fn(args);
}
export function mapOneOrManyArgs(fn) {
    return map(function (args) { return callOrApply(fn, args); });
}
//# sourceMappingURL=mapOneOrManyArgs.js.map