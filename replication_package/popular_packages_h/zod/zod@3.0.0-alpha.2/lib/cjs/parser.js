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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var defaultErrorMap_1 = require("./defaultErrorMap");
var util_1 = require("./helpers/util");
var index_1 = require("./index");
var PseudoPromise_1 = require("./PseudoPromise");
var z = __importStar(require("./types/base"));
var ZodError_1 = require("./ZodError");
exports.getParsedType = function (data) {
    if (typeof data === "string")
        return "string";
    if (typeof data === "number") {
        if (Number.isNaN(data))
            return "nan";
        return "number";
    }
    if (typeof data === "boolean")
        return "boolean";
    if (typeof data === "bigint")
        return "bigint";
    if (typeof data === "symbol")
        return "symbol";
    if (data instanceof Date)
        return "date";
    if (typeof data === "function")
        return "function";
    if (data === undefined)
        return "undefined";
    if (typeof data === "undefined")
        return "undefined";
    if (typeof data === "object") {
        if (Array.isArray(data))
            return "array";
        if (data === null)
            return "null";
        if (data.then &&
            typeof data.then === "function" &&
            data.catch &&
            typeof data.catch === "function") {
            return "promise";
        }
        if (data instanceof Map) {
            return "map";
        }
        return "object";
    }
    return "unknown";
};
exports.ZodParsedType = util_1.util.arrayToEnum([
    "string",
    "nan",
    "number",
    "integer",
    "boolean",
    "date",
    "bigint",
    "symbol",
    "function",
    "undefined",
    "null",
    "array",
    "object",
    "unknown",
    "promise",
    "void",
    "never",
    "map",
]);
var makeError = function (params, data, errorData) {
    var errorArg = __assign(__assign({}, errorData), { path: __spread(params.path, (errorData.path || [])) });
    var ctxArg = { data: data };
    var defaultError = defaultErrorMap_1.defaultErrorMap === params.errorMap
        ? { message: "Invalid value." }
        : defaultErrorMap_1.defaultErrorMap(errorArg, __assign(__assign({}, ctxArg), { defaultError: "Invalid value." }));
    return __assign(__assign({}, errorData), { path: __spread(params.path, (errorData.path || [])), message: errorData.message ||
            params.errorMap(errorArg, __assign(__assign({}, ctxArg), { defaultError: defaultError.message })).message });
};
exports.ZodParser = function (schema) { return function (data, baseParams) {
    var e_1, _a, e_2, _b, e_3, _c, e_4, _d;
    if (baseParams === void 0) { baseParams = { seen: [], errorMap: defaultErrorMap_1.defaultErrorMap, path: [] }; }
    var _e, _f;
    var params = {
        seen: baseParams.seen || [],
        path: baseParams.path || [],
        errorMap: baseParams.errorMap || defaultErrorMap_1.defaultErrorMap,
        async: (_e = baseParams.async) !== null && _e !== void 0 ? _e : false,
        runAsyncValidationsInSeries: (_f = baseParams.runAsyncValidationsInSeries) !== null && _f !== void 0 ? _f : false,
    };
    var def = schema._def;
    var PROMISE = new PseudoPromise_1.PseudoPromise();
    PROMISE._default = true;
    var RESULT = {
        input: data,
        output: util_1.INVALID,
    };
    params.seen = params.seen || [];
    var ERROR = new ZodError_1.ZodError([]);
    var THROW = function () {
        RESULT.error = ERROR;
        throw ERROR;
    };
    var HANDLE = function (err) {
        if (err instanceof ZodError_1.ZodError) {
            ERROR.addIssues(err.issues);
            return util_1.INVALID;
        }
        throw ERROR;
    };
    var parsedType = exports.getParsedType(data);
    switch (def.t) {
        case z.ZodTypes.string:
            if (parsedType !== exports.ZodParsedType.string) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_type,
                    expected: exports.ZodParsedType.string,
                    received: parsedType,
                }));
                THROW();
            }
            PROMISE = PseudoPromise_1.PseudoPromise.resolve(data);
            break;
        case z.ZodTypes.number:
            if (parsedType !== exports.ZodParsedType.number) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_type,
                    expected: exports.ZodParsedType.number,
                    received: parsedType,
                }));
                THROW();
            }
            if (Number.isNaN(data)) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_type,
                    expected: exports.ZodParsedType.number,
                    received: exports.ZodParsedType.nan,
                }));
                THROW();
            }
            PROMISE = PseudoPromise_1.PseudoPromise.resolve(data);
            break;
        case z.ZodTypes.bigint:
            if (parsedType !== exports.ZodParsedType.bigint) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_type,
                    expected: exports.ZodParsedType.bigint,
                    received: parsedType,
                }));
                THROW();
            }
            PROMISE = PseudoPromise_1.PseudoPromise.resolve(data);
            break;
        case z.ZodTypes.boolean:
            if (parsedType !== exports.ZodParsedType.boolean) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_type,
                    expected: exports.ZodParsedType.boolean,
                    received: parsedType,
                }));
                THROW();
            }
            PROMISE = PseudoPromise_1.PseudoPromise.resolve(data);
            break;
        case z.ZodTypes.undefined:
            if (parsedType !== exports.ZodParsedType.undefined) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_type,
                    expected: exports.ZodParsedType.undefined,
                    received: parsedType,
                }));
                THROW();
            }
            PROMISE = PseudoPromise_1.PseudoPromise.resolve(data);
            break;
        case z.ZodTypes.null:
            if (parsedType !== exports.ZodParsedType.null) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_type,
                    expected: exports.ZodParsedType.null,
                    received: parsedType,
                }));
                THROW();
            }
            PROMISE = PseudoPromise_1.PseudoPromise.resolve(data);
            break;
        case z.ZodTypes.any:
            PROMISE = PseudoPromise_1.PseudoPromise.resolve(data);
            break;
        case z.ZodTypes.unknown:
            PROMISE = PseudoPromise_1.PseudoPromise.resolve(data);
            break;
        case z.ZodTypes.never:
            ERROR.addIssue(makeError(params, data, {
                code: ZodError_1.ZodIssueCode.invalid_type,
                expected: exports.ZodParsedType.never,
                received: parsedType,
            }));
            PROMISE = PseudoPromise_1.PseudoPromise.resolve(util_1.INVALID);
            break;
        case z.ZodTypes.void:
            if (parsedType !== exports.ZodParsedType.undefined &&
                parsedType !== exports.ZodParsedType.null) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_type,
                    expected: exports.ZodParsedType.void,
                    received: parsedType,
                }));
                THROW();
            }
            PROMISE = PseudoPromise_1.PseudoPromise.resolve(data);
            break;
        case z.ZodTypes.array:
            RESULT.output = [];
            if (parsedType !== exports.ZodParsedType.array) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_type,
                    expected: exports.ZodParsedType.array,
                    received: parsedType,
                }));
                THROW();
            }
            if (def.nonempty === true && data.length === 0) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.nonempty_array_is_empty,
                }));
                THROW();
            }
            PROMISE = PseudoPromise_1.PseudoPromise.all(data.map(function (item, i) {
                return new PseudoPromise_1.PseudoPromise()
                    .then(function () {
                    return def.type.parse(item, __assign(__assign({}, params), { path: __spread(params.path, [i]) }));
                })
                    .catch(function (err) {
                    if (!(err instanceof ZodError_1.ZodError)) {
                        throw err;
                    }
                    ERROR.addIssues(err.issues);
                    return util_1.INVALID;
                });
            }));
            break;
        case z.ZodTypes.map:
            if (parsedType !== exports.ZodParsedType.map) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_type,
                    expected: exports.ZodParsedType.map,
                    received: parsedType,
                }));
                THROW();
            }
            var dataMap = data;
            var returnedMap_1 = new Map();
            PROMISE = PseudoPromise_1.PseudoPromise.all(__spread(dataMap.entries()).map(function (_a, index) {
                var _b = __read(_a, 2), key = _b[0], value = _b[1];
                return PseudoPromise_1.PseudoPromise.all([
                    new PseudoPromise_1.PseudoPromise()
                        .then(function () {
                        return def.keyType.parse(key, __assign(__assign({}, params), { path: __spread(params.path, [index, "key"]) }));
                    })
                        .catch(HANDLE),
                    new PseudoPromise_1.PseudoPromise()
                        .then(function () {
                        var mapValue = def.valueType.parse(value, __assign(__assign({}, params), { path: __spread(params.path, [index, "value"]) }));
                        return [key, mapValue];
                    })
                        .catch(HANDLE),
                ])
                    .then(function (item) {
                    if (item[0] !== util_1.INVALID && item[1] !== util_1.INVALID) {
                        returnedMap_1.set(item[0], item[1]);
                    }
                })
                    .catch(HANDLE);
            }))
                .then(function () {
                if (!ERROR.isEmpty) {
                    throw ERROR;
                }
            })
                .then(function () {
                return returnedMap_1;
            })
                .then(function () {
                return returnedMap_1;
            });
            break;
        case z.ZodTypes.object:
            RESULT.output = {};
            if (parsedType !== exports.ZodParsedType.object) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_type,
                    expected: exports.ZodParsedType.object,
                    received: parsedType,
                }));
                THROW();
            }
            var objectPromises_1 = {};
            var shape = def.shape();
            var shapeKeys_2 = Object.keys(shape);
            var dataKeys = Object.keys(data);
            var extraKeys = dataKeys.filter(function (k) { return shapeKeys_2.indexOf(k) === -1; });
            var _loop_1 = function (key) {
                var keyValidator = shapeKeys_2.includes(key)
                    ? shape[key]
                    : !(def.catchall instanceof index_1.ZodNever)
                        ? def.catchall
                        : undefined;
                if (!keyValidator) {
                    return "continue";
                }
                if (typeof data[key] === "undefined" && !dataKeys.includes(key)) {
                    objectPromises_1[key] = new PseudoPromise_1.PseudoPromise()
                        .then(function () {
                        return keyValidator.parse(undefined, __assign(__assign({}, params), { path: __spread(params.path, [key]) }));
                    })
                        .then(function (output) {
                        if (output === undefined) {
                            return PseudoPromise_1.NOSET;
                        }
                        else {
                            return output;
                        }
                    })
                        .catch(function (err) {
                        if (err instanceof ZodError_1.ZodError) {
                            var zerr = err;
                            ERROR.addIssues(zerr.issues);
                            objectPromises_1[key] = PseudoPromise_1.PseudoPromise.resolve(util_1.INVALID);
                        }
                        else {
                            throw err;
                        }
                    });
                    return "continue";
                }
                objectPromises_1[key] = new PseudoPromise_1.PseudoPromise()
                    .then(function () {
                    return keyValidator.parse(data[key], __assign(__assign({}, params), { path: __spread(params.path, [key]) }));
                })
                    .catch(function (err) {
                    if (err instanceof ZodError_1.ZodError) {
                        var zerr = err;
                        ERROR.addIssues(zerr.issues);
                        return util_1.INVALID;
                    }
                    else {
                        throw err;
                    }
                });
            };
            try {
                for (var shapeKeys_1 = __values(shapeKeys_2), shapeKeys_1_1 = shapeKeys_1.next(); !shapeKeys_1_1.done; shapeKeys_1_1 = shapeKeys_1.next()) {
                    var key = shapeKeys_1_1.value;
                    _loop_1(key);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (shapeKeys_1_1 && !shapeKeys_1_1.done && (_a = shapeKeys_1.return)) _a.call(shapeKeys_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (def.catchall instanceof index_1.ZodNever) {
                if (def.unknownKeys === "passthrough") {
                    try {
                        for (var extraKeys_1 = __values(extraKeys), extraKeys_1_1 = extraKeys_1.next(); !extraKeys_1_1.done; extraKeys_1_1 = extraKeys_1.next()) {
                            var key = extraKeys_1_1.value;
                            objectPromises_1[key] = PseudoPromise_1.PseudoPromise.resolve(data[key]);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (extraKeys_1_1 && !extraKeys_1_1.done && (_b = extraKeys_1.return)) _b.call(extraKeys_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
                else if (def.unknownKeys === "strict") {
                    if (extraKeys.length > 0) {
                        ERROR.addIssue(makeError(params, data, {
                            code: ZodError_1.ZodIssueCode.unrecognized_keys,
                            keys: extraKeys,
                        }));
                    }
                }
                else if (def.unknownKeys === "strip") {
                }
                else {
                    util_1.util.assertNever(def.unknownKeys);
                }
            }
            else {
                var _loop_2 = function (key) {
                    objectPromises_1[key] = new PseudoPromise_1.PseudoPromise()
                        .then(function () {
                        var parsedValue = def.catchall.parse(data[key], __assign(__assign({}, params), { path: __spread(params.path, [key]) }));
                        return parsedValue;
                    })
                        .catch(function (err) {
                        if (err instanceof ZodError_1.ZodError) {
                            ERROR.addIssues(err.issues);
                        }
                        else {
                            throw err;
                        }
                    });
                };
                try {
                    for (var extraKeys_2 = __values(extraKeys), extraKeys_2_1 = extraKeys_2.next(); !extraKeys_2_1.done; extraKeys_2_1 = extraKeys_2.next()) {
                        var key = extraKeys_2_1.value;
                        _loop_2(key);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (extraKeys_2_1 && !extraKeys_2_1.done && (_c = extraKeys_2.return)) _c.call(extraKeys_2);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
            PROMISE = PseudoPromise_1.PseudoPromise.object(objectPromises_1)
                .then(function (resolvedObject) {
                Object.assign(RESULT.output, resolvedObject);
                return RESULT.output;
            })
                .then(function (finalObject) {
                if (ERROR.issues.length > 0) {
                    return util_1.INVALID;
                }
                return finalObject;
            })
                .catch(function (err) {
                if (err instanceof ZodError_1.ZodError) {
                    ERROR.addIssues(err.issues);
                    return util_1.INVALID;
                }
                throw err;
            });
            break;
        case z.ZodTypes.union:
            var isValid_1 = false;
            var unionErrors_1 = [];
            PROMISE = PseudoPromise_1.PseudoPromise.all(def.options.map(function (opt, _j) {
                return new PseudoPromise_1.PseudoPromise()
                    .then(function () {
                    return opt.parse(data, params);
                })
                    .then(function (optionData) {
                    isValid_1 = true;
                    return optionData;
                })
                    .catch(function (err) {
                    if (err instanceof ZodError_1.ZodError) {
                        unionErrors_1.push(err);
                        return util_1.INVALID;
                    }
                    throw err;
                });
            }))
                .then(function (unionResults) {
                if (!isValid_1) {
                    var nonTypeErrors = unionErrors_1.filter(function (err) {
                        return err.issues[0].code !== "invalid_type";
                    });
                    if (nonTypeErrors.length === 1) {
                        ERROR.addIssues(nonTypeErrors[0].issues);
                    }
                    else {
                        ERROR.addIssue(makeError(params, data, {
                            code: ZodError_1.ZodIssueCode.invalid_union,
                            unionErrors: unionErrors_1,
                        }));
                    }
                    THROW();
                }
                return unionResults;
            })
                .then(function (unionResults) {
                return util_1.util.find(unionResults, function (val) { return val !== util_1.INVALID; });
            });
            break;
        case z.ZodTypes.intersection:
            PROMISE = PseudoPromise_1.PseudoPromise.all([
                new PseudoPromise_1.PseudoPromise()
                    .then(function () {
                    return def.left.parse(data, params);
                })
                    .catch(HANDLE),
                new PseudoPromise_1.PseudoPromise()
                    .then(function () {
                    return def.right.parse(data, params);
                })
                    .catch(HANDLE),
            ]).then(function (_a) {
                var _b = __read(_a, 2), parsedLeft = _b[0], parsedRight = _b[1];
                if (parsedLeft === util_1.INVALID || parsedRight === util_1.INVALID)
                    return util_1.INVALID;
                var parsedLeftType = exports.getParsedType(parsedLeft);
                var parsedRightType = exports.getParsedType(parsedRight);
                if (parsedLeft === parsedRight) {
                    return parsedLeft;
                }
                else if (parsedLeftType === exports.ZodParsedType.object &&
                    parsedRightType === exports.ZodParsedType.object) {
                    return __assign(__assign({}, parsedLeft), parsedRight);
                }
                else {
                    ERROR.addIssue(makeError(params, data, {
                        code: ZodError_1.ZodIssueCode.invalid_intersection_types,
                    }));
                }
            });
            break;
        case z.ZodTypes.optional:
            if (parsedType === exports.ZodParsedType.undefined) {
                PROMISE = PseudoPromise_1.PseudoPromise.resolve(undefined);
                break;
            }
            PROMISE = new PseudoPromise_1.PseudoPromise()
                .then(function () {
                return def.innerType.parse(data, params);
            })
                .catch(HANDLE);
            break;
        case z.ZodTypes.nullable:
            if (parsedType === exports.ZodParsedType.null) {
                PROMISE = PseudoPromise_1.PseudoPromise.resolve(null);
                break;
            }
            PROMISE = new PseudoPromise_1.PseudoPromise()
                .then(function () {
                return def.innerType.parse(data, params);
            })
                .catch(HANDLE);
            break;
        case z.ZodTypes.tuple:
            if (parsedType !== exports.ZodParsedType.array) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_type,
                    expected: exports.ZodParsedType.array,
                    received: parsedType,
                }));
                THROW();
            }
            if (data.length > def.items.length) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.too_big,
                    maximum: def.items.length,
                    inclusive: true,
                    type: "array",
                }));
            }
            else if (data.length < def.items.length) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.too_small,
                    minimum: def.items.length,
                    inclusive: true,
                    type: "array",
                }));
            }
            var tupleData = data;
            PROMISE = PseudoPromise_1.PseudoPromise.all(tupleData.map(function (item, index) {
                var itemParser = def.items[index];
                return new PseudoPromise_1.PseudoPromise()
                    .then(function () {
                    var tupleDatum = itemParser.parse(item, __assign(__assign({}, params), { path: __spread(params.path, [index]) }));
                    return tupleDatum;
                })
                    .catch(function (err) {
                    if (err instanceof ZodError_1.ZodError) {
                        ERROR.addIssues(err.issues);
                        return;
                    }
                    throw err;
                })
                    .then(function (arg) {
                    return arg;
                });
            }))
                .then(function (tupleData) {
                if (!ERROR.isEmpty)
                    THROW();
                return tupleData;
            })
                .catch(function (err) {
                throw err;
            });
            break;
        case z.ZodTypes.lazy:
            var lazySchema = def.getter();
            PROMISE = PseudoPromise_1.PseudoPromise.resolve(lazySchema.parse(data, params));
            break;
        case z.ZodTypes.literal:
            if (data !== def.value) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_literal_value,
                    expected: def.value,
                }));
            }
            PROMISE = PseudoPromise_1.PseudoPromise.resolve(data);
            break;
        case z.ZodTypes.enum:
            if (def.values.indexOf(data) === -1) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_enum_value,
                    options: def.values,
                }));
            }
            PROMISE = PseudoPromise_1.PseudoPromise.resolve(data);
            break;
        case z.ZodTypes.nativeEnum:
            if (util_1.util.getValidEnumValues(def.values).indexOf(data) === -1) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_enum_value,
                    options: util_1.util.objectValues(def.values),
                }));
            }
            PROMISE = PseudoPromise_1.PseudoPromise.resolve(data);
            break;
        case z.ZodTypes.function:
            if (parsedType !== exports.ZodParsedType.function) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_type,
                    expected: exports.ZodParsedType.function,
                    received: parsedType,
                }));
                THROW();
            }
            var isAsyncFunction_1 = def.returns instanceof index_1.ZodPromise;
            var validatedFunction = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var internalProm = new PseudoPromise_1.PseudoPromise()
                    .then(function () {
                    return def.args.parse(args, __assign(__assign({}, params), { async: isAsyncFunction_1 }));
                })
                    .catch(function (err) {
                    if (!(err instanceof ZodError_1.ZodError))
                        throw err;
                    var argsError = new ZodError_1.ZodError([]);
                    argsError.addIssue(makeError(params, data, {
                        code: ZodError_1.ZodIssueCode.invalid_arguments,
                        argumentsError: err,
                    }));
                    throw argsError;
                })
                    .then(function (args) {
                    return data.apply(void 0, __spread(args));
                })
                    .then(function (result) {
                    return def.returns.parse(result, __assign(__assign({}, params), { async: isAsyncFunction_1 }));
                })
                    .catch(function (err) {
                    if (err instanceof ZodError_1.ZodError) {
                        var returnsError = new ZodError_1.ZodError([]);
                        returnsError.addIssue(makeError(params, data, {
                            code: ZodError_1.ZodIssueCode.invalid_return_type,
                            returnTypeError: err,
                        }));
                        throw returnsError;
                    }
                    throw err;
                });
                if (isAsyncFunction_1) {
                    return internalProm.getValueAsync();
                }
                else {
                    return internalProm.getValueSync();
                }
            };
            PROMISE = PseudoPromise_1.PseudoPromise.resolve(validatedFunction);
            break;
        case z.ZodTypes.record:
            if (parsedType !== exports.ZodParsedType.object) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_type,
                    expected: exports.ZodParsedType.object,
                    received: parsedType,
                }));
                THROW();
            }
            var parsedRecordPromises = {};
            var _loop_3 = function (key) {
                parsedRecordPromises[key] = new PseudoPromise_1.PseudoPromise()
                    .then(function () {
                    return def.valueType.parse(data[key], __assign(__assign({}, params), { path: __spread(params.path, [key]) }));
                })
                    .catch(HANDLE);
            };
            for (var key in data) {
                _loop_3(key);
            }
            PROMISE = PseudoPromise_1.PseudoPromise.object(parsedRecordPromises);
            break;
        case z.ZodTypes.date:
            if (!(data instanceof Date)) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_type,
                    expected: exports.ZodParsedType.date,
                    received: parsedType,
                }));
                THROW();
            }
            if (isNaN(data.getTime())) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_date,
                }));
                THROW();
            }
            PROMISE = PseudoPromise_1.PseudoPromise.resolve(data);
            break;
        case z.ZodTypes.promise:
            if (parsedType !== exports.ZodParsedType.promise && params.async !== true) {
                ERROR.addIssue(makeError(params, data, {
                    code: ZodError_1.ZodIssueCode.invalid_type,
                    expected: exports.ZodParsedType.promise,
                    received: parsedType,
                }));
                THROW();
            }
            var promisified = parsedType === exports.ZodParsedType.promise ? data : Promise.resolve(data);
            PROMISE = PseudoPromise_1.PseudoPromise.resolve(promisified.then(function (resolvedData) {
                return def.type.parse(resolvedData, params);
            }));
            break;
        case z.ZodTypes.transformer:
            PROMISE = new PseudoPromise_1.PseudoPromise().then(function () {
                return def.schema.parse(data, params);
            });
            break;
        default:
            PROMISE = PseudoPromise_1.PseudoPromise.resolve("adsf");
            util_1.util.assertNever(def);
    }
    if (PROMISE._default === true) {
        throw new Error("Result is not materialized.");
    }
    if (!ERROR.isEmpty) {
        THROW();
    }
    var effects = def.effects || [];
    var checkCtx = {
        addIssue: function (arg) {
            ERROR.addIssue(makeError(params, data, arg));
        },
        path: params.path,
    };
    if (params.async === false) {
        var resolvedValue = PROMISE.getValueSync();
        if (resolvedValue === util_1.INVALID && ERROR.isEmpty) {
            ERROR.addIssue(makeError(params, data, {
                code: ZodError_1.ZodIssueCode.custom,
                message: "Invalid",
            }));
        }
        if (!ERROR.isEmpty) {
            THROW();
        }
        var finalValue = resolvedValue;
        try {
            for (var effects_1 = __values(effects), effects_1_1 = effects_1.next(); !effects_1_1.done; effects_1_1 = effects_1.next()) {
                var effect = effects_1_1.value;
                if (effect.type === "check") {
                    var checkResult = effect.check(finalValue, checkCtx);
                    if (checkResult instanceof Promise)
                        throw new Error("You can't use .parse() on a schema containing async refinements. Use .parseAsync instead.");
                }
                else if (effect.type === "mod") {
                    if (def.t !== z.ZodTypes.transformer)
                        throw new Error("Only Modders can contain mods");
                    finalValue = effect.mod(finalValue);
                    if (finalValue instanceof Promise) {
                        throw new Error("You can't use .parse() on a schema containing async transformations. Use .parseAsync instead.");
                    }
                }
                else {
                    throw new Error("Invalid effect type.");
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (effects_1_1 && !effects_1_1.done && (_d = effects_1.return)) _d.call(effects_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        if (!ERROR.isEmpty) {
            THROW();
        }
        return finalValue;
    }
    else {
        var checker = function () { return __awaiter(void 0, void 0, void 0, function () {
            var resolvedValue, finalValue, effects_2, effects_2_1, effect, e_5_1;
            var e_5, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, PROMISE.getValueAsync()];
                    case 1:
                        resolvedValue = _b.sent();
                        if (resolvedValue === util_1.INVALID && ERROR.isEmpty) {
                            ERROR.addIssue(makeError(params, data, {
                                code: ZodError_1.ZodIssueCode.custom,
                                message: "Invalid",
                            }));
                        }
                        if (!ERROR.isEmpty) {
                            THROW();
                        }
                        finalValue = resolvedValue;
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 9, 10, 11]);
                        effects_2 = __values(effects), effects_2_1 = effects_2.next();
                        _b.label = 3;
                    case 3:
                        if (!!effects_2_1.done) return [3, 8];
                        effect = effects_2_1.value;
                        if (!(effect.type === "check")) return [3, 5];
                        return [4, effect.check(finalValue, checkCtx)];
                    case 4:
                        _b.sent();
                        return [3, 7];
                    case 5:
                        if (!(effect.type === "mod")) return [3, 7];
                        if (def.t !== z.ZodTypes.transformer)
                            throw new Error("Only Modders can contain mods");
                        return [4, effect.mod(finalValue)];
                    case 6:
                        finalValue = _b.sent();
                        _b.label = 7;
                    case 7:
                        effects_2_1 = effects_2.next();
                        return [3, 3];
                    case 8: return [3, 11];
                    case 9:
                        e_5_1 = _b.sent();
                        e_5 = { error: e_5_1 };
                        return [3, 11];
                    case 10:
                        try {
                            if (effects_2_1 && !effects_2_1.done && (_a = effects_2.return)) _a.call(effects_2);
                        }
                        finally { if (e_5) throw e_5.error; }
                        return [7];
                    case 11:
                        if (!ERROR.isEmpty) {
                            THROW();
                        }
                        return [2, finalValue];
                }
            });
        }); };
        return checker();
    }
}; };
//# sourceMappingURL=parser.js.map