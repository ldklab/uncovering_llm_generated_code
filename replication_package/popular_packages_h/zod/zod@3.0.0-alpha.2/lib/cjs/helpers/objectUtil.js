"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
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
var base_1 = require("../types/base");
var intersection_1 = require("../types/intersection");
var object_1 = require("../types/object");
var objectUtil;
(function (objectUtil) {
    objectUtil.mergeShapes = function (first, second) {
        var e_1, _a;
        var firstKeys = Object.keys(first);
        var secondKeys = Object.keys(second);
        var sharedKeys = firstKeys.filter(function (k) { return secondKeys.indexOf(k) !== -1; });
        var sharedShape = {};
        try {
            for (var sharedKeys_1 = __values(sharedKeys), sharedKeys_1_1 = sharedKeys_1.next(); !sharedKeys_1_1.done; sharedKeys_1_1 = sharedKeys_1.next()) {
                var k = sharedKeys_1_1.value;
                sharedShape[k] = intersection_1.ZodIntersection.create(first[k], second[k]);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (sharedKeys_1_1 && !sharedKeys_1_1.done && (_a = sharedKeys_1.return)) _a.call(sharedKeys_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return __assign(__assign(__assign({}, first), second), sharedShape);
    };
    objectUtil.mergeObjects = function (first) { return function (second) {
        var mergedShape = objectUtil.mergeShapes(first._def.shape(), second._def.shape());
        var merged = new object_1.ZodObject({
            t: base_1.ZodTypes.object,
            effects: __spread((first._def.effects || []), (second._def.effects || [])),
            unknownKeys: first._def.unknownKeys,
            catchall: first._def.catchall,
            shape: function () { return mergedShape; },
        });
        return merged;
    }; };
})(objectUtil = exports.objectUtil || (exports.objectUtil = {}));
//# sourceMappingURL=objectUtil.js.map