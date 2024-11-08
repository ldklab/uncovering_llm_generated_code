"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forkJoin = void 0;
var Observable_1 = require("../Observable");
var map_1 = require("../operators/map");
var argsArgArrayOrObject_1 = require("../util/argsArgArrayOrObject");
var from_1 = require("./from");
var args_1 = require("../util/args");
function forkJoin() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var resultSelector = args_1.popResultSelector(args);
    var _a = argsArgArrayOrObject_1.argsArgArrayOrObject(args), sources = _a.args, keys = _a.keys;
    if (resultSelector) {
        return forkJoinInternal(sources, keys).pipe(map_1.map(function (values) { return resultSelector.apply(void 0, __spread(values)); }));
    }
    return forkJoinInternal(sources, keys);
}
exports.forkJoin = forkJoin;
function forkJoinInternal(sources, keys) {
    return new Observable_1.Observable(function (subscriber) {
        var len = sources.length;
        if (len === 0) {
            subscriber.complete();
            return;
        }
        var values = new Array(len);
        var completed = 0;
        var emitted = 0;
        var _loop_1 = function (sourceIndex) {
            var source = from_1.innerFrom(sources[sourceIndex]);
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