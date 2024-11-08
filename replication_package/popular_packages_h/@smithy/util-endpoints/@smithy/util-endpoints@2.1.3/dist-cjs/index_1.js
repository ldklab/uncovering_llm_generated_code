const { URL } = require('url');
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;

var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
    for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
};

var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
            if (!__hasOwnProp.call(to, key) && key !== except)
                __defProp(to, key, {
                    get: () => from[key],
                    enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
                });
    }
    return to;
};

var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// Cache Management
class EndpointCache {
    constructor({ size, params }) {
        this.data = new Map();
        this.parameters = [];
        this.capacity = size ?? 50;
        if (params) {
            this.parameters = params;
        }
    }

    get(endpointParams, resolver) {
        const key = this.hash(endpointParams);
        if (key === false) {
            return resolver();
        }
        if (!this.data.has(key)) {
            if (this.data.size > this.capacity + 10) {
                const keys = this.data.keys();
                let i = 0;
                while (true) {
                    const { value, done } = keys.next();
                    this.data.delete(value);
                    if (done || ++i > 10) {
                        break;
                    }
                }
            }
            this.data.set(key, resolver());
        }
        return this.data.get(key);
    }

    size() {
        return this.data.size;
    }

    hash(endpointParams) {
        let buffer = "";
        if (this.parameters.length === 0) {
            return false;
        }
        for (const param of this.parameters) {
            const val = String(endpointParams[param] ?? "");
            if (val.includes("|;")) {
                return false;
            }
            buffer += val + "|;";
        }
        return buffer;
    }
}

// Endpoint Utility Functions
var IP_V4_REGEX = new RegExp('^(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}$');
function isIpAddress(value) {
    return IP_V4_REGEX.test(value) || (value.startsWith("[") && value.endsWith("]"));
}

var VALID_HOST_LABEL_REGEX = new RegExp('^(?!.*-$)(?!-)[a-zA-Z0-9-]{1,63}$');
function isValidHostLabel(value, allowSubDomains = false) {
    if (!allowSubDomains) {
        return VALID_HOST_LABEL_REGEX.test(value);
    }
    const labels = value.split(".");
    for (const label of labels) {
        if (!isValidHostLabel(label)) {
            return false;
        }
    }
    return true;
}

// Error Handling
class EndpointError extends Error {
    constructor(message) {
        super(message);
        this.name = "EndpointError";
    }
}

// Template Evaluation and Utilities
function toDebugString(input) {
    if (typeof input !== "object" || input == null) {
        return input;
    }
    if ("ref" in input) {
        return `$${toDebugString(input.ref)}`;
    }
    if ("fn" in input) {
        return `${input.fn}(${(input.argv || []).map(toDebugString).join(", ")})`;
    }
    return JSON.stringify(input, null, 2);
}

// Rule Evaluation Logic
function evaluateExpression(obj, keyName, options) {
    if (typeof obj === "string") {
        return evaluateTemplate(obj, options);
    } else if (obj["fn"]) {
        return callFunction(obj, options);
    } else if (obj["ref"]) {
        return getReferenceValue(obj, options);
    }
    throw new EndpointError(`'${keyName}': ${String(obj)} is not a string, function or reference.`);
}

function evaluateTemplate(template, options) {
    const evaluatedTemplateArr = [];
    const templateContext = {
        ...options.endpointParams,
        ...options.referenceRecord
    };
    let currentIndex = 0;
    while (currentIndex < template.length) {
        const openingBraceIndex = template.indexOf("{", currentIndex);
        if (openingBraceIndex === -1) {
            evaluatedTemplateArr.push(template.slice(currentIndex));
            break;
        }
        evaluatedTemplateArr.push(template.slice(currentIndex, openingBraceIndex));
        const closingBraceIndex = template.indexOf("}", openingBraceIndex);
        if (closingBraceIndex === -1) {
            evaluatedTemplateArr.push(template.slice(openingBraceIndex));
            break;
        }
        if (template[openingBraceIndex + 1] === "{" && template[closingBraceIndex + 1] === "}") {
            evaluatedTemplateArr.push(template.slice(openingBraceIndex + 1, closingBraceIndex));
            currentIndex = closingBraceIndex + 2;
        }
        const parameterName = template.substring(openingBraceIndex + 1, closingBraceIndex);
        if (parameterName.includes("#")) {
            const [refName, attrName] = parameterName.split("#");
            evaluatedTemplateArr.push(getAttr(templateContext[refName], attrName));
        } else {
            evaluatedTemplateArr.push(templateContext[parameterName]);
        }
        currentIndex = closingBraceIndex + 1;
    }
    return evaluatedTemplateArr.join("");
}

function getReferenceValue({ ref }, options) {
    const referenceRecord = {
        ...options.endpointParams,
        ...options.referenceRecord
    };
    return referenceRecord[ref];
}

function callFunction({ fn, argv }, options) {
    const evaluatedArgs = argv.map((arg) =>
        ["boolean", "number"].includes(typeof arg) ? arg : evaluateExpression(arg, "arg", options)
    );
    const fnSegments = fn.split(".");
    if (fnSegments[0] in customEndpointFunctions && fnSegments[1] != null) {
        return customEndpointFunctions[fnSegments[0]][fnSegments[1]](...evaluatedArgs);
    }
    return endpointFunctions[fn](...evaluatedArgs);
}

// Rule Evaluation
function evaluateRules(rules, options) {
    for (const rule of rules) {
        if (rule.type === "endpoint") {
            const endpointOrUndefined = evaluateEndpointRule(rule, options);
            if (endpointOrUndefined) {
                return endpointOrUndefined;
            }
        } else if (rule.type === "error") {
            evaluateErrorRule(rule, options);
        } else if (rule.type === "tree") {
            const endpointOrUndefined = evaluateTreeRule(rule, options);
            if (endpointOrUndefined) {
                return endpointOrUndefined;
            }
        } else {
            throw new EndpointError(`Unknown endpoint rule: ${rule}`);
        }
    }
    throw new EndpointError(`Rules evaluation failed`);
}

// Main Endpoint Resolution
function resolveEndpoint(ruleSetObject, options) {
    const { endpointParams, logger } = options;
    const { parameters, rules } = ruleSetObject;
    const paramsWithDefault = Object.entries(parameters)
        .filter(([, v]) => v.default !== undefined)
        .map(([k, v]) => [k, v.default]);

    if (paramsWithDefault.length > 0) {
        for (const [paramKey, paramDefaultValue] of paramsWithDefault) {
            endpointParams[paramKey] = endpointParams[paramKey] ?? paramDefaultValue;
        }
    }
    const requiredParams = Object.entries(parameters)
        .filter(([, v]) => v.required)
        .map(([k]) => k);

    for (const requiredParam of requiredParams) {
        if (endpointParams[requiredParam] == null) {
            throw new EndpointError(`Missing required parameter: '${requiredParam}'`);
        }
    }
    const endpoint = evaluateRules(rules, { endpointParams, logger, referenceRecord: {} });
    return endpoint;
}

var src_exports = {};
__export(src_exports, {
    EndpointCache: () => EndpointCache,
    EndpointError: () => EndpointError,
    customEndpointFunctions: () => customEndpointFunctions,
    isIpAddress: () => isIpAddress,
    isValidHostLabel: () => isValidHostLabel,
    resolveEndpoint: () => resolveEndpoint
});
module.exports = __toCommonJS(src_exports);

