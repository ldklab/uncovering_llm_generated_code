"use strict";

const __read = (this && this.__read) || ((o, n) => {
    const m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    const i = m.call(o), ar = [];
    for (let r; (n === undefined || n-- > 0) && !(r = i.next()).done;) ar.push(r.value);
    return ar;
});

const __spreadArray = (to, from, pack) => pack || arguments.length === 2
    ? to.concat(from)
    : to.concat(Array.from(from));

const __importDefault = (mod) => (mod && mod.__esModule) ? mod : { "default": mod };

Object.defineProperty(exports, "__esModule", { value: true });
exports.unique = exports.mergeWithRules = exports.mergeWithCustomize = exports.default = exports.merge = exports.CustomizeRule = exports.customizeObject = exports.customizeArray = void 0;

const wildcard_1 = __importDefault(require("wildcard"));
const merge_with_1 = __importDefault(require("./merge-with"));
const join_arrays_1 = __importDefault(require("./join-arrays"));
const unique_1 = __importDefault(require("./unique"));

exports.unique = unique_1.default;

const types_1 = require("./types");
Object.defineProperty(exports, "CustomizeRule", { enumerable: true, get: () => types_1.CustomizeRule });

const utils_1 = require("./utils");

function merge(firstConfiguration, ...configurations) {
    return mergeWithCustomize({})(firstConfiguration, ...configurations);
}
exports.merge = merge;
exports.default = merge;

function mergeWithCustomize(options) {
    return function mergeWithOptions(firstConfiguration, ...configurations) {
        if ((0, utils_1.isUndefined)(firstConfiguration) || configurations.some(utils_1.isUndefined)) {
            throw new TypeError("Merging undefined is not supported");
        }
        if (firstConfiguration?.then) {
            throw new TypeError("Promises are not supported");
        }
        if (!firstConfiguration) {
            return {};
        }
        if (configurations.length === 0) {
            if (Array.isArray(firstConfiguration)) {
                if (firstConfiguration.length === 0) {
                    return {};
                }
                if (firstConfiguration.some(utils_1.isUndefined)) {
                    throw new TypeError("Merging undefined is not supported");
                }
                if (firstConfiguration[0]?.then) {
                    throw new TypeError("Promises are not supported");
                }
                return (0, merge_with_1.default)(firstConfiguration, (0, join_arrays_1.default)(options));
            }
            return firstConfiguration;
        }
        return (0, merge_with_1.default)([firstConfiguration, ...configurations], (0, join_arrays_1.default)(options));
    };
}
exports.mergeWithCustomize = mergeWithCustomize;

function customizeArray(rules) {
    return function (a, b, key) {
        const matchedRule = Object.keys(rules).find(rule => (0, wildcard_1.default)(rule, key)) || "";
        if (matchedRule) {
            switch (rules[matchedRule]) {
                case types_1.CustomizeRule.Prepend:
                    return [...b, ...a];
                case types_1.CustomizeRule.Replace:
                    return b;
                case types_1.CustomizeRule.Append:
                default:
                    return [...a, ...b];
            }
        }
    };
}
exports.customizeArray = customizeArray;

function mergeWithRules(rules) {
    return mergeWithCustomize({
        customizeArray: (a, b, key) => {
            let currentRule = rules;
            key.split(".").forEach(k => {
                if (currentRule) {
                    currentRule = currentRule[k];
                }
            });
            if ((0, utils_1.isPlainObject)(currentRule)) {
                return mergeWithRule({ currentRule, a, b });
            }
            if (typeof currentRule === "string") {
                return mergeIndividualRule({ currentRule, a, b });
            }
            return undefined;
        }
    });
}
exports.mergeWithRules = mergeWithRules;

const isArray = Array.isArray;

function mergeWithRule({ currentRule, a, b }) {
    if (!isArray(a)) {
        return a;
    }
    const bAllMatches = [];
    const ret = a.map(ao => {
        if (!(0, utils_1.isPlainObject)(currentRule)) {
            return ao;
        }
        const ret = {};
        const rulesToMatch = [];
        const operations = {};
        Object.entries(currentRule).forEach(([k, v]) => {
            if (v === types_1.CustomizeRule.Match) {
                rulesToMatch.push(k);
            } else {
                operations[k] = v;
            }
        });
        const bMatches = b.filter(o => {
            const matches = rulesToMatch.every(rule => (0, utils_1.isSameCondition)(ao[rule], o[rule]));
            if (matches) {
                bAllMatches.push(o);
            }
            return matches;
        });
        if (!(0, utils_1.isPlainObject)(ao)) {
            return ao;
        }
        Object.entries(ao).forEach(([k, v]) => {
            const rule = currentRule;
            switch (currentRule[k]) {
                case types_1.CustomizeRule.Match:
                    ret[k] = v;
                    Object.entries(rule).forEach(([k, v]) => {
                        if (v === types_1.CustomizeRule.Replace && bMatches.length > 0) {
                            const val = last(bMatches)[k];
                            if (typeof val !== "undefined") {
                                ret[k] = val;
                            }
                        }
                    });
                    break;
                case types_1.CustomizeRule.Append:
                    if (!bMatches.length) {
                        ret[k] = v;
                        break;
                    }
                    const appendValue = last(bMatches)[k];
                    if (!isArray(v) || !isArray(appendValue)) {
                        throw new TypeError("Trying to append non-arrays");
                    }
                    ret[k] = v.concat(appendValue);
                    break;
                case types_1.CustomizeRule.Merge:
                    if (!bMatches.length) {
                        ret[k] = v;
                        break;
                    }
                    const lastValue = last(bMatches)[k];
                    if (!(0, utils_1.isPlainObject)(v) || !(0, utils_1.isPlainObject)(lastValue)) {
                        throw new TypeError("Trying to merge non-objects");
                    }
                    ret[k] = merge(v, lastValue);
                    break;
                case types_1.CustomizeRule.Prepend:
                    if (!bMatches.length) {
                        ret[k] = v;
                        break;
                    }
                    const prependValue = last(bMatches)[k];
                    if (!isArray(v) || !isArray(prependValue)) {
                        throw new TypeError("Trying to prepend non-arrays");
                    }
                    ret[k] = prependValue.concat(v);
                    break;
                case types_1.CustomizeRule.Replace:
                    ret[k] = bMatches.length > 0 ? last(bMatches)[k] : v;
                    break;
                default:
                    const currentRule = operations[k];
                    const b = bMatches
                        .map(o => o[k])
                        .reduce((acc, val) => isArray(acc) && isArray(val) ? acc.concat(val) : acc, []);
                    ret[k] = mergeWithRule({ currentRule, a: v, b });
                    break;
            }
        });
        return ret;
    });
    return ret.concat(b.filter(o => !bAllMatches.includes(o)));
}

function mergeIndividualRule({ currentRule, a, b }) {
    switch (currentRule) {
        case types_1.CustomizeRule.Append:
            return a.concat(b);
        case types_1.CustomizeRule.Prepend:
            return b.concat(a);
        case types_1.CustomizeRule.Replace:
            return b;
    }
    return a;
}

function last(arr) {
    return arr[arr.length - 1];
}

function customizeObject(rules) {
    return (a, b, key) => {
        switch (rules[key]) {
            case types_1.CustomizeRule.Prepend:
                return merge_with_1.default([b, a], join_arrays_1.default());
            case types_1.CustomizeRule.Replace:
                return b;
            case types_1.CustomizeRule.Append:
                return merge_with_1.default([a, b], join_arrays_1.default());
        }
    };
}
exports.customizeObject = customizeObject;
