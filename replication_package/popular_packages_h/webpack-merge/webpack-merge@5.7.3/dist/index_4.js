"use strict";

var __assign = function (target, ...sources) {
    sources.forEach(source => {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    });
    return target;
};

var __read = function (iterable, limit) {
    const iterator = typeof Symbol === "function" && iterable[Symbol.iterator] || iterable['@@iterator'];
    if (!iterator) return iterable;
    
    let result, i = 0, array = [];
    for (let item of iterator.call(iterable)) {
        if (limit && i >= limit) break;
        array.push(item);
        i++;
    }
    return array;
};

var __spread = (...args) => [].concat(...args.map(arg => __read(arg)));

var __importDefault = mod => (mod && mod.__esModule) ? mod : { default: mod };

exports.__esModule = true;
exports.unique = exports.mergeWithRules = exports.mergeWithCustomize = exports.default = exports.merge = exports.CustomizeRule = exports.customizeObject = exports.customizeArray = void 0;

var wildcard = __importDefault(require("wildcard"));
var mergeWith = __importDefault(require("./merge-with"));
var joinArrays = __importDefault(require("./join-arrays"));
var unique = __importDefault(require("./unique"));
exports.unique = unique.default;

var { CustomizeRule } = require("./types");
exports.CustomizeRule = CustomizeRule;
var { isUndefined, isPlainObject } = require("./utils");

function merge(firstConfig, ...restConfigs) {
    return mergeWithCustomize({})(firstConfig, ...restConfigs);
}
exports.merge = merge;
exports.default = merge;

function mergeWithCustomize(options) {
    return function mergeWithOptions(firstConfig, ...configs) {
        if (isUndefined(firstConfig) || configs.some(isUndefined)) {
            throw new TypeError("Merging undefined is not supported");
        }
        
        if (firstConfig && firstConfig.then) {
            throw new TypeError("Promises are not supported");
        }
        
        if (!firstConfig) return {};
        
        if (configs.length === 0) {
            if (Array.isArray(firstConfig)) {
                if (firstConfig.length === 0 || firstConfig.some(isUndefined)) {
                    throw new TypeError("Merging undefined is not supported");
                }
                
                if (firstConfig[0].then) {
                    throw new TypeError("Promises are not supported");
                }
                
                return mergeWith.default(firstConfig, joinArrays.default(options));
            }
            return firstConfig;
        }
        
        return mergeWith.default([firstConfig, ...configs], joinArrays.default(options));
    };
}
exports.mergeWithCustomize = mergeWithCustomize;

function customizeArray(rules) {
    return function (a, b, key) {
        const matchedRule = Object.keys(rules).find(rule => wildcard.default(rule, key)) || "";
        switch (rules[matchedRule]) {
            case CustomizeRule.Prepend:
                return __spread(b, a);
            case CustomizeRule.Replace:
                return b;
            case CustomizeRule.Append:
            default:
                return __spread(a, b);
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

const isArray = Array.isArray;

function mergeWithRule({ currentRule, a, b }) {
    if (!isArray(a)) {
        return a;
    }
    
    const bAllMatches = [];
    const result = a.map(ao => {
        if (!isPlainObject(currentRule)) {
            return ao;
        }
        
        const ret = {};
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
            const matches = rulesToMatch.every(rule => (ao[rule]?.toString() || '') === (o[rule]?.toString() || ''));
            if (matches) {
                bAllMatches.push(o);
            }
            return matches;
        });
        
        if (!isPlainObject(ao)) {
            return ao;
        }
        
        Object.entries(ao).forEach(([k, v]) => {
            const rule = currentRule[k];
            switch (rule) {
                case CustomizeRule.Match:
                    ret[k] = v;
                    Object.entries(currentRule).forEach(([k, v]) => {
                        if (v === CustomizeRule.Replace && bMatches.length > 0) {
                            const val = last(bMatches)[k];
                            if (val !== undefined) {
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
                    if (!isArray(v) || !isArray(appendValue)) {
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
                    ret[k] = __assign(__assign({}, v), lastValue);
                    break;
                case CustomizeRule.Prepend:
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
                case CustomizeRule.Replace:
                    ret[k] = bMatches.length > 0 ? last(bMatches)[k] : v;
                    break;
                default:
                    const currentOperation = operations[k];
                    const bVals = bMatches.map(o => o[k]).flat();
                    ret[k] = mergeWithRule({ currentRule: currentOperation, a: v, b: bVals });
                    break;
            }
        });
        
        return ret;
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
                return mergeWith.default([b, a], joinArrays.default());
            case CustomizeRule.Replace:
                return b;
            case CustomizeRule.Append:
                return mergeWith.default([a, b], joinArrays.default());
        }
    };
}
exports.customizeObject = customizeObject;
