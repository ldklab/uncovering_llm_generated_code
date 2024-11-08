"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customizeObject = exports.customizeArray = exports.mergeWithRules = exports.mergeWithCustomize = exports.default = exports.merge = exports.CustomizeRule = exports.unique = void 0;

var wildcard_1 = require("wildcard");
var merge_with_1 = require("./merge-with");
var join_arrays_1 = require("./join-arrays");
var unique_1 = require("./unique");
exports.unique = unique_1.default;

var types_1 = require("./types");
Object.defineProperty(exports, "CustomizeRule", { enumerable: true, get: function () { return types_1.CustomizeRule; } });

var utils_1 = require("./utils");

function merge(firstConfiguration, ...configurations) {
    return mergeWithCustomize({})(firstConfiguration, ...configurations);
}
exports.merge = merge;
exports.default = merge;

function mergeWithCustomize(options) {
    return function mergeWithOptions(firstConfiguration, ...configurations) {
        if (utils_1.isUndefined(firstConfiguration) || configurations.some(utils_1.isUndefined)) {
            throw new TypeError("Merging undefined is not supported");
        }
        if (firstConfiguration?.then) {
            throw new TypeError("Promises are not supported");
        }
        if (!firstConfiguration) return Array.isArray(firstConfiguration) ? {} : firstConfiguration;

        return merge_with_1.default([firstConfiguration, ...configurations], join_arrays_1.default(options));
    };
}
exports.mergeWithCustomize = mergeWithCustomize;

function customizeArray(rules) {
    return function (a, b, key) {
        const matchedRule = Object.keys(rules).find(rule => wildcard_1.default(rule, key)) || "";
        switch (rules[matchedRule]) {
            case types_1.CustomizeRule.Prepend:
                return [...b, ...a];
            case types_1.CustomizeRule.Replace:
                return b;
            case types_1.CustomizeRule.Append:
            default:
                return [...a, ...b];
        }
    };
}
exports.customizeArray = customizeArray;

function mergeWithRules(rules) {
    return mergeWithCustomize({
        customizeArray: (a, b, key) => {
            let currentRule = rules;
            key.split(".").forEach(k => currentRule = currentRule?.[k]);
            return utils_1.isPlainObject(currentRule) ? mergeWithRule({ currentRule, a, b }) : typeof currentRule === "string" ? mergeIndividualRule({ currentRule, a, b }) : undefined;
        },
    });
}
exports.mergeWithRules = mergeWithRules;

function mergeWithRule({ currentRule, a, b }) {
    if (!Array.isArray(a)) return a;
    let bAllMatches = [];
    const ret = a.map(ao => {
        if (!utils_1.isPlainObject(currentRule)) return ao;
        const ret = {};
        const rulesToMatch = [];
        const operations = {};
        
        Object.entries(currentRule).forEach(([k, v]) => {
            v === types_1.CustomizeRule.Match ? rulesToMatch.push(k) : operations[k] = v;
        });

        const bMatches = b.filter(o => rulesToMatch.every(rule => utils_1.isSameCondition(ao[rule], o[rule])));
        bMatches.forEach(o => bAllMatches.push(o));

        if (!utils_1.isPlainObject(ao)) return ao;

        Object.entries(ao).forEach(([k, v]) => {
            switch (currentRule[k]) {
                case types_1.CustomizeRule.Match:
                    ret[k] = v;
                    bMatches.length && Object.entries(currentRule).forEach(([k, rule]) => {
                        rule === types_1.CustomizeRule.Replace && (ret[k] = last(bMatches)[k] ?? v);
                    });
                    break;
                case types_1.CustomizeRule.Append:
                    ret[k] = bMatches.length ? v.concat(last(bMatches)[k]) : v;
                    break;
                case types_1.CustomizeRule.Merge:
                    ret[k] = bMatches.length ? merge(v, last(bMatches)[k]) : v;
                    break;
                case types_1.CustomizeRule.Prepend:
                    ret[k] = bMatches.length ? last(bMatches)[k].concat(v) : v;
                    break;
                case types_1.CustomizeRule.Replace:
                    ret[k] = bMatches.length > 0 ? last(bMatches)[k] : v;
                    break;
                default:
                    const currentSubRule = operations[k];
                    const bCollected = bMatches.map(o => o[k]).reduce((acc, val) => Array.isArray(val) ? [...acc, ...val] : acc, []);
                    ret[k] = mergeWithRule({ currentRule: currentSubRule, a: v, b: bCollected });
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
    return function (a, b, key) {
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
