"use strict";

var assignObject = Object.assign || function (target) {
    for (let i = 1; i < arguments.length; i++) {
        let source = arguments[i];
        for (let key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
};

function spread() {
    let result = [];
    for (let i = 0; i < arguments.length; i++) {
        result = result.concat([...arguments[i]]);
    }
    return result;
}

var wildcard = require("wildcard").default;
var mergeWith = require("./merge-with").default;
var joinArrays = require("./join-arrays").default;
var unique = require("./unique").default;
exports.unique = unique;
var { CustomizeRule } = require("./types");
var { isUndefined, isPlainObject } = require("./utils");

function merge(firstConfig, ...configs) {
    return mergeWithCustomize({})(firstConfig, ...configs);
}
exports.merge = merge;
exports.default = merge;

function mergeWithCustomize(options) {
    return function mergeWithOptions(firstConfig, ...configs) {
        if (isUndefined(firstConfig) || configs.some(isUndefined)) {
            throw new TypeError("Merging undefined is not supported");
        }
        if (firstConfig.then) {
            throw new TypeError("Promises are not supported");
        }
        if (!firstConfig) {
            return {};
        }
        if (configs.length === 0) {
            if (Array.isArray(firstConfig)) {
                if (firstConfig.length === 0 || firstConfig.some(isUndefined)) {
                    throw new TypeError("Merging undefined is not supported");
                }
                if (firstConfig[0].then) {
                    throw new TypeError("Promises are not supported");
                }
                return mergeWith(firstConfig, joinArrays(options));
            }
            return firstConfig;
        }
        return mergeWith([firstConfig, ...configs], joinArrays(options));
    };
}
exports.mergeWithCustomize = mergeWithCustomize;

function customizeArray(rules) {
    return function (a, b, key) {
        let matchedRule = Object.keys(rules).find(rule => wildcard(rule, key)) || "";
        if (matchedRule) {
            switch (rules[matchedRule]) {
                case CustomizeRule.Prepend:
                    return spread(b, a);
                case CustomizeRule.Replace:
                    return b;
                case CustomizeRule.Append:
                default:
                    return spread(a, b);
            }
        }
    };
}
exports.customizeArray = customizeArray;

function mergeWithRules(rules) {
    return mergeWithCustomize({
        customizeArray: function (a, b, key) {
            let currentRule = rules;
            key.split(".").forEach(k => {
                if (currentRule) {
                    currentRule = currentRule[k];
                }
            });
            if (isPlainObject(currentRule)) {
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

var isArray = Array.isArray;

function mergeWithRule({ currentRule, a, b }) {
    if (!isArray(a)) {
        return a;
    }
    let bAllMatches = [];
    let result = a.map(ao => {
        if (!isPlainObject(currentRule)) {
            return ao;
        }
        let result = {};
        let rulesToMatch = [];
        let operations = {};
        Object.entries(currentRule).forEach(([k, v]) => {
            if (v === CustomizeRule.Match) {
                rulesToMatch.push(k);
            } else {
                operations[k] = v;
            }
        });

        let bMatches = b.filter(o => {
            let matches = rulesToMatch.every(rule => ao[rule]?.toString() === o[rule]?.toString());
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
                    result[k] = v;
                    Object.entries(currentRule).forEach(([k, v]) => {
                        if (v === CustomizeRule.Replace && bMatches.length > 0) {
                            let val = last(bMatches)[k];
                            if (typeof val !== "undefined") {
                                result[k] = val;
                            }
                        }
                    });
                    break;
                case CustomizeRule.Append:
                    if (!bMatches.length) {
                        result[k] = v;
                        break;
                    }
                    let appendValue = last(bMatches)[k];
                    if (!isArray(v) || !isArray(appendValue)) {
                        throw new TypeError("Trying to append non-arrays");
                    }
                    result[k] = v.concat(appendValue);
                    break;
                case CustomizeRule.Merge:
                    if (!bMatches.length) {
                        result[k] = v;
                        break;
                    }
                    let lastValue = last(bMatches)[k];
                    if (!isPlainObject(v) || !isPlainObject(lastValue)) {
                        throw new TypeError("Trying to merge non-objects");
                    }
                    result[k] = assignObject({}, v, lastValue);
                    break;
                case CustomizeRule.Prepend:
                    if (!bMatches.length) {
                        result[k] = v;
                        break;
                    }
                    let prependValue = last(bMatches)[k];
                    if (!isArray(v) || !isArray(prependValue)) {
                        throw new TypeError("Trying to prepend non-arrays");
                    }
                    result[k] = prependValue.concat(v);
                    break;
                case CustomizeRule.Replace:
                    result[k] = bMatches.length > 0 ? last(bMatches)[k] : v;
                    break;
                default:
                    const currentOps = operations[k];
                    let bValues = bMatches.map(o => o[k]).reduce((acc, val) => isArray(acc) && isArray(val) ? [...acc, ...val] : acc, []);
                    result[k] = mergeWithRule({ currentRule: currentOps, a: v, b: bValues });
                    break;
            }
        });
        return result;
    });

    return result.concat(b.filter(o => !bAllMatches.includes(o)));
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
    return function (a, b, key) {
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
