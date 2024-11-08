"use strict";

// Utility functions for merging
function assign(target, ...sources) {
    return Object.assign(target, ...sources);
}

function readIterable(iterable, n) {
    const ar = [];
    const m = `${Symbol.iterator}` in iterable ? iterable[Symbol.iterator]() : null;
    if (!m) return ar;
    let r, index = 0;
    while ((n === undefined || n-- > 0) && !(r = m.next()).done) {
        ar.push(r.value);
        index++;
    }
    return ar;
}

function spread(...args) {
    return args.reduce((acc, val) => acc.concat(readIterable(val)), []);
}

// Import dependencies
const wildcard = require("wildcard").default;
const mergeWith = require("./merge-with").default;
const joinArrays = require("./join-arrays").default;
const unique = require("./unique").default;
const { CustomizeRule } = require("./types");
const utils = require("./utils");

// Exported functions
function merge(firstConfig, ...configs) {
    return mergeWithCustomize({})(firstConfig, ...configs);
}

function mergeWithCustomize(options) {
    return function(firstConfig, ...configs) {
        if (utils.isUndefined(firstConfig) || configs.some(utils.isUndefined)) {
            throw new TypeError("Merging undefined is not supported");
        }
        if (firstConfig && firstConfig.then) {
            throw new TypeError("Promises are not supported");
        }
        if (!firstConfig) {
            return {};
        }
        return configs.length === 0
            ? Array.isArray(firstConfig) && firstConfig.length === 0
                ? {}
                : mergeWith(firstConfig, joinArrays(options))
            : mergeWith([firstConfig, ...configs], joinArrays(options));
    };
}

function customizeArray(rules) {
    return function(a, b, key) {
        const matchedRule = Object.keys(rules).find(rule => wildcard(rule, key)) || "";
        switch (rules[matchedRule]) {
            case CustomizeRule.Prepend: return spread(b, a);
            case CustomizeRule.Replace: return b;
            case CustomizeRule.Append:
            default: return spread(a, b);
        }
    };
}

function mergeWithRules(rules) {
    return mergeWithCustomize({
        customizeArray: function(a, b, key) {
            let currentRule = rules;
            key.split(".").forEach(k => currentRule && (currentRule = currentRule[k]));

            if (utils.isPlainObject(currentRule)) {
                return mergeWithRule({ currentRule, a, b });
            }
            if (typeof currentRule === "string") {
                return mergeIndividualRule({ currentRule, a, b });
            }
        }
    });
}

function mergeWithRule({ currentRule, a, b }) {
    if (!Array.isArray(a)) return a;
    const ret = a.map(ao => {
        if (!utils.isPlainObject(currentRule)) {
            return ao;
        }
        const ret = {};
        const rulesToMatch = [];
        const operations = [];
        Object.entries(currentRule).forEach(([k, v]) => {
            if (v === CustomizeRule.Match) {
                rulesToMatch.push(k);
            } else {
                operations[k] = v;
            }
        });

        const bMatches = b.filter(o => rulesToMatch.every(rule => ao[rule]?.toString() === o[rule]?.toString()));
        if (!utils.isPlainObject(ao)) {
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
                    if (!utils.isPlainObject(v) || !utils.isPlainObject(lastValue)) {
                        throw new TypeError("Trying to merge non-objects");
                    }
                    ret[k] = assign({}, v, lastValue);
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
                    const b = bMatches.map(o => o[k]).reduce((acc, val) => Array.isArray(acc) && Array.isArray(val) ? [...acc, ...val] : acc, []);
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

module.exports = {
    default: merge,
    merge,
    mergeWithCustomize,
    mergeWithRules,
    customizeArray,
    customizeObject,
    unique
};
