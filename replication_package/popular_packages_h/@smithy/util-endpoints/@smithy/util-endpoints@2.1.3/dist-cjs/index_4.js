const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, prototype } = Object;
const { hasOwnProperty } = prototype;
const setName = (target, value) => defineProperty(target, "name", { value, configurable: true });
const exportModule = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};
const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, { get: () => from[key], enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
};
const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// src/index.ts
const srcExports = {};
exportModule(srcExports, {
  EndpointCache: () => EndpointCache,
  EndpointError: () => EndpointError,
  customEndpointFunctions: () => customEndpointFunctions,
  isIpAddress: () => isIpAddress,
  isValidHostLabel: () => isValidHostLabel,
  resolveEndpoint: () => resolveEndpoint
});
module.exports = toCommonJS(srcExports);

// src/cache/EndpointCache.ts
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
    if (key === false) return resolver();
    if (!this.data.has(key)) {
      if (this.data.size > this.capacity + 10) {
        const keys = this.data.keys();
        let i = 0;
        while (true) {
          const { value, done } = keys.next();
          this.data.delete(value);
          if (done || ++i > 10) break;
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
    if (this.parameters.length === 0) return false;
    let buffer = "";
    for (const param of this.parameters) {
      const val = String(endpointParams[param] ?? "");
      if (val.includes("|;")) return false;
      buffer += val + "|;";
    }
    return buffer;
  }
}
setName(EndpointCache, "EndpointCache");

// src/lib/isIpAddress.ts
const IP_V4_REGEX = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/;
const isIpAddress = setName(
  (value) => IP_V4_REGEX.test(value) || (value.startsWith("[") && value.endsWith("]")),
  "isIpAddress"
);

// src/lib/isValidHostLabel.ts
const VALID_HOST_LABEL_REGEX = /^(?!.*-$)(?!-)[a-zA-Z0-9-]{1,63}$/;
const isValidHostLabel = setName((value, allowSubDomains = false) => {
  if (!allowSubDomains) return VALID_HOST_LABEL_REGEX.test(value);
  const labels = value.split(".");
  for (const label of labels) {
    if (!isValidHostLabel(label)) return false;
  }
  return true;
}, "isValidHostLabel");

// src/utils/customEndpointFunctions.ts
const customEndpointFunctions = {};

// src/debug/debugId.ts
const debugId = "endpoints";

// src/debug/toDebugString.ts
function toDebugString(input) {
  if (typeof input !== "object" || input == null) return input;
  if ("ref" in input) return `$${toDebugString(input.ref)}`;
  if ("fn" in input) return `${input.fn}(${(input.argv || []).map(toDebugString).join(", ")})`;
  return JSON.stringify(input, null, 2);
}
setName(toDebugString, "toDebugString");

// src/types/EndpointError.ts
class EndpointError extends Error {
  constructor(message) {
    super(message);
    this.name = "EndpointError";
  }
}
setName(EndpointError, "EndpointError");

// src/lib/booleanEquals.ts
const booleanEquals = setName((value1, value2) => value1 === value2, "booleanEquals");

// src/lib/getAttrPathList.ts
const getAttrPathList = setName((path) => {
  const parts = path.split(".");
  const pathList = [];
  for (const part of parts) {
    const squareBracketIndex = part.indexOf("[");
    if (squareBracketIndex !== -1) {
      if (part.indexOf("]") !== part.length - 1) {
        throw new EndpointError(`Path: '${path}' does not end with ']'`);
      }
      const arrayIndex = part.slice(squareBracketIndex + 1, -1);
      if (Number.isNaN(parseInt(arrayIndex))) {
        throw new EndpointError(`Invalid array index: '${arrayIndex}' in path: '${path}'`);
      }
      if (squareBracketIndex !== 0) {
        pathList.push(part.slice(0, squareBracketIndex));
      }
      pathList.push(arrayIndex);
    } else {
      pathList.push(part);
    }
  }
  return pathList;
}, "getAttrPathList");

// src/lib/getAttr.ts
const getAttr = setName((value, path) => getAttrPathList(path).reduce((acc, index) => {
  if (typeof acc !== "object") {
    throw new EndpointError(`Index '${index}' in '${path}' not found in '${JSON.stringify(value)}'`);
  } else if (Array.isArray(acc)) {
    return acc[parseInt(index)];
  }
  return acc[index];
}, value), "getAttr");

// src/lib/isSet.ts
const isSet = setName((value) => value != null, "isSet");

// src/lib/not.ts
const not = setName((value) => !value, "not");

// src/lib/parseURL.ts
const { EndpointURLScheme } = require("@smithy/types");
const DEFAULT_PORTS = {
  [EndpointURLScheme.HTTP]: 80,
  [EndpointURLScheme.HTTPS]: 443
};
const parseURL = setName((value) => {
  const whatwgURL = (() => {
    try {
      if (value instanceof URL) return value;
      if (typeof value === "object" && "hostname" in value) {
        const { hostname, port, protocol = "", path = "", query = {} } = value;
        const url = new URL(`${protocol}//${hostname}${port ? `:${port}` : ""}${path}`);
        url.search = Object.entries(query).map(([k, v]) => `${k}=${v}`).join("&");
        return url;
      }
      return new URL(value);
    } catch (error) {
      return null;
    }
  })();
  if (!whatwgURL) {
    console.error(`Unable to parse ${JSON.stringify(value)} as a whatwg URL.`);
    return null;
  }
  const urlString = whatwgURL.href;
  const { host, hostname, pathname, protocol, search } = whatwgURL;
  if (search) return null;
  const scheme = protocol.slice(0, -1);
  if (!Object.values(EndpointURLScheme).includes(scheme)) return null;
  const isIp = isIpAddress(hostname);
  const inputContainsDefaultPort = urlString.includes(`${host}:${DEFAULT_PORTS[scheme]}`) || (typeof value === "string" && value.includes(`${host}:${DEFAULT_PORTS[scheme]}`));
  const authority = `${host}${inputContainsDefaultPort ? `:${DEFAULT_PORTS[scheme]}` : ``}`;
  return {
    scheme,
    authority,
    path: pathname,
    normalizedPath: pathname.endsWith("/") ? pathname : `${pathname}/`,
    isIp
  };
}, "parseURL");

// src/lib/stringEquals.ts
const stringEquals = setName((value1, value2) => value1 === value2, "stringEquals");

// src/lib/substring.ts
const substring = setName((input, start, stop, reverse) => {
  if (start >= stop || input.length < stop) return null;
  if (!reverse) return input.substring(start, stop);
  return input.substring(input.length - stop, input.length - start);
}, "substring");

// src/lib/uriEncode.ts
const uriEncode = setName((value) => encodeURIComponent(value).replace(/[!*'()]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`), "uriEncode");

// src/utils/endpointFunctions.ts
const endpointFunctions = {
  booleanEquals,
  getAttr,
  isSet,
  isValidHostLabel,
  not,
  parseURL,
  stringEquals,
  substring,
  uriEncode
};

// src/utils/evaluateTemplate.ts
const evaluateTemplate = setName((template, options) => {
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
}, "evaluateTemplate");

// src/utils/getReferenceValue.ts
const getReferenceValue = setName(({ ref }, options) => {
  const referenceRecord = {
    ...options.endpointParams,
    ...options.referenceRecord
  };
  return referenceRecord[ref];
}, "getReferenceValue");

// src/utils/evaluateExpression.ts
const evaluateExpression = setName((obj, keyName, options) => {
  if (typeof obj === "string") return evaluateTemplate(obj, options);
  if (obj["fn"]) return callFunction(obj, options);
  if (obj["ref"]) return getReferenceValue(obj, options);
  throw new EndpointError(`'${keyName}': ${String(obj)} is not a string, function or reference.`);
}, "evaluateExpression");

// src/utils/callFunction.ts
const callFunction = setName(({ fn, argv }, options) => {
  const evaluatedArgs = argv.map(
    (arg) => ["boolean", "number"].includes(typeof arg) ? arg : evaluateExpression(arg, "arg", options)
  );
  const fnSegments = fn.split(".");
  if (fnSegments[0] in customEndpointFunctions && fnSegments[1] != null) {
    return customEndpointFunctions[fnSegments[0]][fnSegments[1]](...evaluatedArgs);
  }
  return endpointFunctions[fn](...evaluatedArgs);
}, "callFunction");

// src/utils/evaluateCondition.ts
const evaluateCondition = setName(({ assign, ...fnArgs }, options) => {
  if (assign && assign in options.referenceRecord) {
    throw new EndpointError(`'${assign}' is already defined in Reference Record.`);
  }
  const value = callFunction(fnArgs, options);
  options.logger?.debug?.(`${debugId} evaluateCondition: ${toDebugString(fnArgs)} = ${toDebugString(value)}`);
  return {
    result: value === "" ? true : !!value,
    ...assign != null && { toAssign: { name: assign, value } }
  };
}, "evaluateCondition");

// src/utils/evaluateConditions.ts
const evaluateConditions = setName((conditions = [], options) => {
  const conditionsReferenceRecord = {};
  for (const condition of conditions) {
    const { result, toAssign } = evaluateCondition(condition, {
      ...options,
      referenceRecord: {
        ...options.referenceRecord,
        ...conditionsReferenceRecord
      }
    });
    if (!result) return { result };
    if (toAssign) {
      conditionsReferenceRecord[toAssign.name] = toAssign.value;
      options.logger?.debug?.(`${debugId} assign: ${toAssign.name} := ${toDebugString(toAssign.value)}`);
    }
  }
  return { result: true, referenceRecord: conditionsReferenceRecord };
}, "evaluateConditions");

// src/utils/getEndpointHeaders.ts
const getEndpointHeaders = setName((headers, options) => Object.entries(headers).reduce(
  (acc, [headerKey, headerVal]) => ({
    ...acc,
    [headerKey]: headerVal.map((headerValEntry) => {
      const processedExpr = evaluateExpression(headerValEntry, "Header value entry", options);
      if (typeof processedExpr !== "string") {
        throw new EndpointError(`Header '${headerKey}' value '${processedExpr}' is not a string`);
      }
      return processedExpr;
    })
  }),
  {}
), "getEndpointHeaders");

// src/utils/getEndpointProperty.ts
const getEndpointProperty = setName((property, options) => {
  if (Array.isArray(property)) {
    return property.map((propertyEntry) => getEndpointProperty(propertyEntry, options));
  }
  switch (typeof property) {
    case "string":
      return evaluateTemplate(property, options);
    case "object":
      if (property === null) throw new EndpointError(`Unexpected endpoint property: ${property}`);
      return getEndpointProperties(property, options);
    case "boolean":
      return property;
    default:
      throw new EndpointError(`Unexpected endpoint property type: ${typeof property}`);
  }
}, "getEndpointProperty");

// src/utils/getEndpointProperties.ts
const getEndpointProperties = setName((properties, options) => Object.entries(properties).reduce(
  (acc, [propertyKey, propertyVal]) => ({
    ...acc,
    [propertyKey]: getEndpointProperty(propertyVal, options)
  }),
  {}
), "getEndpointProperties");

// src/utils/getEndpointUrl.ts
const getEndpointUrl = setName((endpointUrl, options) => {
  const expression = evaluateExpression(endpointUrl, "Endpoint URL", options);
  if (typeof expression === "string") {
    try {
      return new URL(expression);
    } catch (error) {
      console.error(`Failed to construct URL with ${expression}`, error);
      throw error;
    }
  }
  throw new EndpointError(`Endpoint URL must be a string, got ${typeof expression}`);
}, "getEndpointUrl");

// src/utils/evaluateEndpointRule.ts
const evaluateEndpointRule = setName((endpointRule, options) => {
  const { conditions, endpoint } = endpointRule;
  const { result, referenceRecord } = evaluateConditions(conditions, options);
  if (!result) return;

  const endpointRuleOptions = {
    ...options,
    referenceRecord: { ...options.referenceRecord, ...referenceRecord }
  };
  const { url, properties, headers } = endpoint;
  options.logger?.debug?.(`${debugId} Resolving endpoint from template: ${toDebugString(endpoint)}`);
  return {
    ...headers != null && {
      headers: getEndpointHeaders(headers, endpointRuleOptions)
    },
    ...properties != null && {
      properties: getEndpointProperties(properties, endpointRuleOptions)
    },
    url: getEndpointUrl(url, endpointRuleOptions)
  };
}, "evaluateEndpointRule");

// src/utils/evaluateErrorRule.ts
const evaluateErrorRule = setName((errorRule, options) => {
  const { conditions, error } = errorRule;
  const { result, referenceRecord } = evaluateConditions(conditions, options);
  if (!result) return;
  throw new EndpointError(
    evaluateExpression(error, "Error", {
      ...options,
      referenceRecord: { ...options.referenceRecord, ...referenceRecord }
    })
  );
}, "evaluateErrorRule");

// src/utils/evaluateTreeRule.ts
const evaluateTreeRule = setName((treeRule, options) => {
  const { conditions, rules } = treeRule;
  const { result, referenceRecord } = evaluateConditions(conditions, options);
  if (!result) return;

  return evaluateRules(rules, {
    ...options,
    referenceRecord: { ...options.referenceRecord, ...referenceRecord }
  });
}, "evaluateTreeRule");

// src/utils/evaluateRules.ts
const evaluateRules = setName((rules, options) => {
  for (const rule of rules) {
    if (rule.type === "endpoint") {
      const endpointOrUndefined = evaluateEndpointRule(rule, options);
      if (endpointOrUndefined) return endpointOrUndefined;
    } else if (rule.type === "error") {
      evaluateErrorRule(rule, options);
    } else if (rule.type === "tree") {
      const endpointOrUndefined = evaluateTreeRule(rule, options);
      if (endpointOrUndefined) return endpointOrUndefined;
    } else {
      throw new EndpointError(`Unknown endpoint rule: ${rule}`);
    }
  }
  throw new EndpointError(`Rules evaluation failed`);
}, "evaluateRules");

// src/resolveEndpoint.ts
const resolveEndpoint = setName((ruleSetObject, options) => {
  const { endpointParams, logger } = options;
  const { parameters, rules } = ruleSetObject;
  logger?.debug?.(`${debugId} Initial EndpointParams: ${toDebugString(endpointParams)}`);

  const paramsWithDefault = Object.entries(parameters).filter(([, v]) => v.default != null).map(([k, v]) => [k, v.default]);
  if (paramsWithDefault.length > 0) {
    for (const [paramKey, paramDefaultValue] of paramsWithDefault) {
      endpointParams[paramKey] = endpointParams[paramKey] ?? paramDefaultValue;
    }
  }

  const requiredParams = Object.entries(parameters).filter(([, v]) => v.required).map(([k]) => k);
  for (const requiredParam of requiredParams) {
    if (endpointParams[requiredParam] == null) {
      throw new EndpointError(`Missing required parameter: '${requiredParam}'`);
    }
  }

  const endpoint = evaluateRules(rules, { endpointParams, logger, referenceRecord: {} });
  logger?.debug?.(`${debugId} Resolved endpoint: ${toDebugString(endpoint)}`);
  return endpoint;
}, "resolveEndpoint");

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EndpointCache,
  isIpAddress,
  isValidHostLabel,
  customEndpointFunctions,
  resolveEndpoint,
  EndpointError
});
