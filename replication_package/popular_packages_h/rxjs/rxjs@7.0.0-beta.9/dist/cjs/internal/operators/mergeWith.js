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
exports.mergeWith = exports.merge = void 0;
var lift_1 = require("../util/lift");
var argsOrArgArray_1 = require("../util/argsOrArgArray");
var fromArray_1 = require("../observable/fromArray");
var mergeAll_1 = require("./mergeAll");
var args_1 = require("../util/args");
function merge() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args_1.popScheduler(args);
    var concurrent = args_1.popNumber(args, Infinity);
    args = argsOrArgArray_1.argsOrArgArray(args);
    return lift_1.operate(function (source, subscriber) {
        mergeAll_1.mergeAll(concurrent)(fromArray_1.internalFromArray(__spread([source], args), scheduler)).subscribe(subscriber);
    });
}
exports.merge = merge;
function mergeWith() {
    var otherSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherSources[_i] = arguments[_i];
    }
    return merge.apply(void 0, __spread(otherSources));
}
exports.mergeWith = mergeWith;
//# sourceMappingURL=mergeWith.js.map