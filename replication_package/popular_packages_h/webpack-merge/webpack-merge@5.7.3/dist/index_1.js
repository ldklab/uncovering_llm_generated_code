"use strict";

const wildcard = require("wildcard");
const mergeWith = require("./merge-with");
const joinArrays = require("./join-arrays");
const unique = require("./unique");
const { CustomizeRule } = require("./types");
const { isUndefined, isPlainObject } = require("./utils");

function merge(firstConfiguration, ...configurations) {
    return mergeWithCustomize({})(firstConfiguration, ...configurations);
}

function mergeWithCustomize(options) {
    return function(firstConfiguration, ...configurations) {
        if (isUndefined(firstConfiguration) || configurations.some(isUndefined)) {
            throw new TypeError("Merging undefined is not supported");
        }
        
        if (firstConfiguration.then) {
            throw new TypeError("Promises are not supported");
        }
        
        if (!firstConfiguration) {
            return {};
        }
        
        if (configurations.length === 0) {
            if (Array.isArray(firstConfiguration)) {
                if (firstConfiguration.length === 0 || firstConfiguration.some(isUndefined)) {
                    throw new TypeError("Merging undefined is not supported");
                }
                if (firstConfiguration[0].then) {
                    throw new TypeError("Promises are not supported");
                }
                return mergeWith(firstConfiguration, joinArrays(options));
            }
            return firstConfiguration;
        }
        
        return mergeWith([firstConfiguration, ...configurations], joinArrays(options));
    };
}

function customizeArray(rules) {
    return (a, b, key) => {
        const matchedRule = Object.keys(rules).find(rule => wildcard(rule, key)) || "";
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

function mergeWithRules(rules) {
    return mergeWithCustomize({
        customizeArray: (a, b, key) => {
            let currentRule = rules;
            key.split(".").forEach(k => {
                if (!currentRule) return;
                currentRule = currentRule[k];
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

function mergeWithRule({ currentRule, a, b }) {
    if (!Array.isArray(a)) {
        return a;
    }
    const bAllMatches = [];
    const ret = a.map(ao => {
        if (!isPlainObject(currentRule)) {
            return ao;
        }
        let ret = {};
        const rulesToMatch = [];
        const operations = {};
        Object.entries(currentRule).forEach(([k, v]) => {
            if (v === CustomizeRule.Match) {
                rulesToMatch.push(k);
            } else {
                operations[k] = v;
            }
        });
        const bMatches = b.filter(o => {
            const matches = rulesToMatch.every(rule => ao[rule]?.toString() === o[rule]?.toString());
            if (matches) {
                bAllMatches.push(o);
            }
            return matches;
        });
        if (!isPlainObject(ao)) {
            return ao;
        }
        Object.entries(ao).forEach(([k, v]) => {
            const rule = currentRule;
            switch (currentRule[k]) {
                case CustomizeRule.Match:
                    ret[k] = v;
                    Object.entries(rule).forEach(([k, v]) => {
                        if (v === CustomizeRule.Replace && bMatches.length > 0) {
                            const val = last(bMatches)[k];
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
                    const appendValue = last(bMatches)[k];
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
                    const lastValue = last(bMatches)[k];
                    if (!isPlainObject(v) || !isPlainObject(lastValue)) {
                        throw new TypeError("Trying to merge non-objects");
                    }
                    ret[k] = { ...v, ...lastValue };
                    break;
                case CustomizeRule.Prepend:
                    if (!bMatches.length) {
                        ret[k] = v;
                        break;
                    }
                    const prependValue = last(bMatches)[k];
                    if (!Array.isArray(v) || !Array.isArray(prependValue)) {
                        throw new TypeError("Trying to prepend non-arrays");
                    }
                    ret[k] = prependValue.concat(v);
                    break;
                case CustomizeRule.Replace:
                    ret[k] = bMatches.length > 0 ? last(bMatches)[k] : v;
                    break;
                default:
                    const currentRule = operations[k];
                    const b = bMatches
                        .map(o => o[k])
                        .reduce((acc, val) => {
                            return Array.isArray(acc) && Array.isArray(val) ? [...acc, ...val] : acc;
                        }, []);
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
    return (a, b, key) => {
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

module.exports = {
    merge,
    default: merge,
    mergeWithCustomize,
    customizeArray,
    customizeObject,
    mergeWithRules,
    unique
};
