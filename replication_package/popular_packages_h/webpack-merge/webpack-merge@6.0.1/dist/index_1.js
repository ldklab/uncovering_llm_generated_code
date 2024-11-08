"use strict";

var __assign = (this && this.__assign) || function() {
    return Object.assign.apply(Object, arguments);
};

var wildcard = require("wildcard").default;
var mergeWith = require("./merge-with").default;
var joinArrays = require("./join-arrays").default;
var unique = require("./unique").default;
var { CustomizeRule } = require("./types");
var { isUndefined, isPlainObject, isSameCondition } = require("./utils");

function merge(firstConfiguration, ...configurations) {
    return mergeWithCustomize({})(
        firstConfiguration,
        ...configurations
    );
}
exports.merge = merge;
exports.default = merge;

function mergeWithCustomize(options) {
    return function(firstConfiguration, ...configurations) {
        if (isUndefined(firstConfiguration) || configurations.some(isUndefined)) {
            throw new TypeError("Merging undefined is not supported");
        }
        if (firstConfiguration && typeof firstConfiguration.then === 'function') {
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
                if (firstConfiguration.some(isUndefined)) {
                    throw new TypeError("Merging undefined is not supported");
                }
                if (typeof firstConfiguration[0].then === 'function') {
                    throw new TypeError("Promises are not supported");
                }
                return mergeWith(firstConfiguration, joinArrays(options));
            }
            return firstConfiguration;
        }
        return mergeWith([firstConfiguration, ...configurations], joinArrays(options));
    };
}
exports.mergeWithCustomize = mergeWithCustomize;

function customizeArray(rules) {
    return function(a, b, key) {
        var matchedRule = Object.keys(rules).find(rule => wildcard(rule, key)) || "";
        if (matchedRule) {
            switch (rules[matchedRule]) {
                case CustomizeRule.Prepend:
                    return [...b, ...a];
                case CustomizeRule.Replace:
                    return b;
                case CustomizeRule.Append:
                default:
                    return [...a, ...b];
            }
        }
    };
}
exports.customizeArray = customizeArray;

function mergeWithRules(rules) {
    return mergeWithCustomize({
        customizeArray: function(a, b, key) {
            var currentRule = rules;
            key.split(".").forEach(k => currentRule = currentRule && currentRule[k]);
            if (isPlainObject(currentRule)) {
                return mergeWithRule({ currentRule, a, b });
            }
            if (typeof currentRule === "string") {
                return mergeIndividualRule({ currentRule, a, b });
            }
            return undefined;
        },
    });
}
exports.mergeWithRules = mergeWithRules;

function mergeWithRule({ currentRule, a, b }) {
    if (!Array.isArray(a)) {
        return a;
    }
    var bAllMatches = [];
    var ret = a.map(ao => {
        if (!isPlainObject(currentRule)) {
            return ao;
        }
        var ret = {};
        var rulesToMatch = [];
        var operations = {};
        Object.entries(currentRule).forEach(([k, v]) => {
            if (v === CustomizeRule.Match) {
                rulesToMatch.push(k);
            } else {
                operations[k] = v;
            }
        });

        var bMatches = b.filter(o => {
            var matches = rulesToMatch.every(rule => isSameCondition(ao[rule], o[rule]));
            if (matches) {
                bAllMatches.push(o);
            }
            return matches;
        });

        if (!isPlainObject(ao)) {
            return ao;
        }

        Object.entries(ao).forEach(([k, v]) => {
            switch (currentRule[k]) {
                case CustomizeRule.Match:
                    ret[k] = v;
                    Object.entries(currentRule).forEach(([k, v]) => {
                        if (v === CustomizeRule.Replace && bMatches.length > 0) {
                            var val = last(bMatches)[k];
                            if (typeof val !== "undefined") {
                                ret[k] = val;
                            }
                        }
                    });
                    break;
                case CustomizeRule.Append:
                    if (!bMatches.length) {
                        ret[k] = v;
                        break;
                    }
                    var appendValue = last(bMatches)[k];
                    if (!Array.isArray(v) || !Array.isArray(appendValue)) {
                        throw new TypeError("Trying to append non-arrays");
                    }
                    ret[k] = v.concat(appendValue);
                    break;
                case CustomizeRule.Merge:
                    if (!bMatches.length) {
                        ret[k] = v;
                        break;
                    }
                    var lastValue = last(bMatches)[k];
                    if (!isPlainObject(v) || !isPlainObject(lastValue)) {
                        throw new TypeError("Trying to merge non-objects");
                    }
                    ret[k] = merge(v, lastValue);
                    break;
                case CustomizeRule.Prepend:
                    if (!bMatches.length) {
                        ret[k] = v;
                        break;
                    }
                    var prependValue = last(bMatches)[k];
                    if (!Array.isArray(v) || !Array.isArray(prependValue)) {
                        throw new TypeError("Trying to prepend non-arrays");
                    }
                    ret[k] = prependValue.concat(v);
                    break;
                case CustomizeRule.Replace:
                    ret[k] = bMatches.length > 0 ? last(bMatches)[k] : v;
                    break;
                default:
                    var operation = operations[k];
                    var bFiltered = bMatches.flatMap(o => o[k]);
                    ret[k] = mergeWithRule({
                        currentRule: operation,
                        a: v,
                        b: bFiltered,
                    });
                    break;
            }
        });

        return ret;
    });

    return ret.concat(b.filter(o => !bAllMatches.includes(o)));
}

function mergeIndividualRule({ currentRule, a, b }) {
    switch (currentRule) {
        case CustomizeRule.Append:
            return a.concat(b);
        case CustomizeRule.Prepend:
            return b.concat(a);
        case CustomizeRule.Replace:
            return b;
    }
    return a;
}

function last(arr) {
    return arr[arr.length - 1];
}

function customizeObject(rules) {
    return function(a, b, key) {
        switch (rules[key]) {
            case CustomizeRule.Prepend:
                return mergeWith([b, a], joinArrays());
            case CustomizeRule.Replace:
                return b;
            case CustomizeRule.Append:
                return mergeWith([a, b], joinArrays());
        }
    };
}
exports.customizeObject = customizeObject;
