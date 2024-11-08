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
exports.zipWith = exports.zip = void 0;
var zip_1 = require("../observable/zip");
var lift_1 = require("../util/lift");
function zip() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    return lift_1.operate(function (source, subscriber) {
        zip_1.zip.apply(void 0, __spread([source], sources)).subscribe(subscriber);
    });
}
exports.zip = zip;
function zipWith() {
    var otherInputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherInputs[_i] = arguments[_i];
    }
    return zip.apply(void 0, __spread(otherInputs));
}
exports.zipWith = zipWith;
//# sourceMappingURL=zipWith.js.map