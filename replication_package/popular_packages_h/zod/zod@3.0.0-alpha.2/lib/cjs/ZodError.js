"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./helpers/util");
exports.ZodIssueCode = util_1.util.arrayToEnum([
    "invalid_type",
    "nonempty_array_is_empty",
    "custom",
    "invalid_union",
    "invalid_literal_value",
    "invalid_enum_value",
    "unrecognized_keys",
    "invalid_arguments",
    "invalid_return_type",
    "invalid_date",
    "invalid_string",
    "too_small",
    "too_big",
    "invalid_intersection_types",
]);
exports.quotelessJson = function (obj) {
    var json = JSON.stringify(obj, null, 2);
    return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = (function (_super) {
    __extends(ZodError, _super);
    function ZodError(issues) {
        var _newTarget = this.constructor;
        var _this = _super.call(this) || this;
        _this.issues = [];
        _this.addIssue = function (sub) {
            _this.issues = __spread(_this.issues, [sub]);
        };
        _this.addIssues = function (subs) {
            if (subs === void 0) { subs = []; }
            _this.issues = __spread(_this.issues, subs);
        };
        _this.flatten = function () {
            var e_1, _a;
            var fieldErrors = {};
            var formErrors = [];
            try {
                for (var _b = __values(_this.issues), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var sub = _c.value;
                    if (sub.path.length > 0) {
                        fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
                        fieldErrors[sub.path[0]].push(sub.message);
                    }
                    else {
                        formErrors.push(sub.message);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return { formErrors: formErrors, fieldErrors: fieldErrors };
        };
        var actualProto = _newTarget.prototype;
        Object.setPrototypeOf(_this, actualProto);
        _this.issues = issues;
        return _this;
    }
    Object.defineProperty(ZodError.prototype, "errors", {
        get: function () {
            return this.issues;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ZodError.prototype, "message", {
        get: function () {
            return JSON.stringify(this.issues, null, 2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ZodError.prototype, "isEmpty", {
        get: function () {
            return this.issues.length === 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ZodError.prototype, "formErrors", {
        get: function () {
            return this.flatten();
        },
        enumerable: true,
        configurable: true
    });
    ZodError.create = function (issues) {
        var error = new ZodError(issues);
        return error;
    };
    return ZodError;
}(Error));
exports.ZodError = ZodError;
//# sourceMappingURL=ZodError.js.map